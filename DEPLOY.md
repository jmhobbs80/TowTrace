# TowTrace Deployment Guide

This document provides comprehensive instructions for deploying the TowTrace application to production using AWS services. The deployment strategy maintains the Cloudflare Workers backend while leveraging AWS for web hosting and mobile app distribution.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [Domain Configuration](#domain-configuration)
4. [Backend Deployment](#backend-deployment)
5. [Web Dashboard Deployment](#web-dashboard-deployment)
6. [Mobile App Deployment](#mobile-app-deployment)
7. [Monitoring and Maintenance](#monitoring-and-maintenance)
8. [Security Considerations](#security-considerations)
9. [Scaling Strategy](#scaling-strategy)
10. [Rollback Procedures](#rollback-procedures)

## Prerequisites

Before beginning deployment, ensure you have:

- AWS account with administrator access
- Domain name (www.towtrace.com) with access to DNS settings
- Cloudflare account (for Workers and D1 database)
- Apple Developer account (for iOS app distribution)
- Google Play Developer account (for Android app distribution)
- AWS CLI installed and configured
- Node.js v18+ and npm v8+
- Database migration scripts prepared
- CI/CD tools configured (GitHub Actions or AWS CodePipeline)

## Architecture Overview

Production architecture:

```
                    +-------------------+
                    |   DNS (Route 53)  |
                    +---------+---------+
                              |
              +---------------+---------------+
              |                               |
    +---------v---------+         +-----------v-----------+
    |  CloudFront CDN   |         |  Cloudflare Workers   |
    +---------+---------+         +-----------+-----------+
              |                               |
    +---------v---------+         +-----------v-----------+
    |   S3 (Web Host)   |         |   Cloudflare D1 DB    |
    +-------------------+         +-----------------------+
            
    +-----------------------+     +-----------------------+
    |  AWS Cognito (Auth)   |     |  CloudWatch (Logs)    |
    +-----------------------+     +-----------------------+
    
    +-------------------+         +-------------------+
    |  Apple App Store  |         |  Google Play      |
    +-------------------+         +-------------------+
```

## Domain Configuration

### Setting up AWS Route 53

1. **Create a hosted zone**:
   ```bash
   aws route53 create-hosted-zone --name towtrace.com --caller-reference $(date +%s)
   ```

2. **Update name servers with your domain registrar**:
   - Retrieve the name servers assigned to your hosted zone:
   ```bash
   aws route53 get-hosted-zone --id [HOSTED-ZONE-ID]
   ```
   - Update these name servers with your domain registrar

3. **Create DNS records**:
   - A record for apex domain:
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id [HOSTED-ZONE-ID] --change-batch '{
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "towtrace.com",
           "Type": "A",
           "AliasTarget": {
             "HostedZoneId": "[CLOUDFRONT-HOSTED-ZONE-ID]",
             "DNSName": "[CLOUDFRONT-DISTRIBUTION-DOMAIN]",
             "EvaluateTargetHealth": false
           }
         }
       }
     ]
   }'
   ```
   
   - CNAME for www subdomain:
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id [HOSTED-ZONE-ID] --change-batch '{
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "www.towtrace.com",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [
             {
               "Value": "[CLOUDFRONT-DISTRIBUTION-DOMAIN]"
             }
           ]
         }
       }
     ]
   }'
   ```

4. **Configure API subdomain**:
   ```bash
   aws route53 change-resource-record-sets --hosted-zone-id [HOSTED-ZONE-ID] --change-batch '{
     "Changes": [
       {
         "Action": "CREATE",
         "ResourceRecordSet": {
           "Name": "api.towtrace.com",
           "Type": "CNAME",
           "TTL": 300,
           "ResourceRecords": [
             {
               "Value": "[CLOUDFLARE-WORKER-DOMAIN]"
             }
           ]
         }
       }
     ]
   }'
   ```

5. **Set up SSL certificate**:
   ```bash
   aws acm request-certificate --domain-name towtrace.com --validation-method DNS --subject-alternative-names "*.towtrace.com"
   ```

6. **Validate the certificate** (follow AWS ACM instructions for DNS validation)

## Backend Deployment

The backend will continue to use Cloudflare Workers and D1 database, but we'll formalize the deployment process.

### Cloudflare Workers Deployment

1. **Set up production environment variables**:
   - Create a `.env.production` file:
   ```
   ENVIRONMENT=production
   DATABASE=production_db
   AUTH_DOMAIN=auth.towtrace.com
   ```

2. **Configure Wrangler for production**:
   - Update `wrangler.toml`:
   ```toml
   [env.production]
   name = "towtrace-api-production"
   route = "api.towtrace.com/*"
   
   [env.production.vars]
   ENVIRONMENT = "production"
   
   [env.production.d1_databases]
   binding = "DB"
   database_name = "towtrace-production"
   database_id = "[YOUR-D1-DATABASE-ID]"
   ```

3. **Deploy to production**:
   ```bash
   cd backend/towtrace-api
   npx wrangler deploy --env production
   ```

4. **Set up Cloudflare Workers secrets**:
   ```bash
   npx wrangler secret put JWT_SECRET --env production
   npx wrangler secret put GOOGLE_CLIENT_ID --env production
   npx wrangler secret put GOOGLE_CLIENT_SECRET --env production
   # Add any other required secrets
   ```

5. **Deploy database migrations**:
   ```bash
   npx wrangler d1 execute towtrace-production --file=./schema.sql
   ```

6. **Configure Cloudflare Workers analytics** for monitoring

## Web Dashboard Deployment

### AWS S3 and CloudFront Setup

1. **Create S3 bucket**:
   ```bash
   aws s3 mb s3://towtrace-dashboard-production --region us-east-1
   ```

2. **Configure bucket for static website hosting**:
   ```bash
   aws s3 website s3://towtrace-dashboard-production --index-document index.html --error-document 404.html
   ```

3. **Set bucket policy for public access**:
   ```bash
   aws s3api put-bucket-policy --bucket towtrace-dashboard-production --policy '{
     "Version": "2012-10-17",
     "Statement": [
       {
         "Sid": "PublicReadGetObject",
         "Effect": "Allow",
         "Principal": "*",
         "Action": "s3:GetObject",
         "Resource": "arn:aws:s3:::towtrace-dashboard-production/*"
       }
     ]
   }'
   ```

4. **Create CloudFront distribution**:
   ```bash
   aws cloudfront create-distribution \
     --origin-domain-name towtrace-dashboard-production.s3-website-us-east-1.amazonaws.com \
     --default-root-object index.html \
     --aliases towtrace.com www.towtrace.com \
     --ssl-certificate [ACM-CERTIFICATE-ARN] \
     --default-cache-behavior ForwardedValues='{QueryString=true,Cookies={Forward=none}}',ViewerProtocolPolicy=redirect-to-https
   ```

5. **Configure CloudFront for SPA routing**:
   - Create an error response for 404 errors that returns `/index.html` with a 200 status code
   ```bash
   aws cloudfront update-distribution --id [DISTRIBUTION-ID] --error-responses '[{
     "ErrorCode": 404,
     "ResponsePagePath": "/index.html",
     "ResponseCode": 200,
     "ErrorCachingMinTTL": 300
   }]'
   ```

### Dashboard Build and Deployment

1. **Set up environment variables**:
   - Create `.env.production` file:
   ```
   NEXT_PUBLIC_API_URL=https://api.towtrace.com
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=[YOUR-GOOGLE-CLIENT-ID]
   ```

2. **Build the dashboard**:
   ```bash
   cd frontend/towtrace-dashboard-new
   npm install
   npm run build
   ```

3. **Deploy to S3**:
   ```bash
   aws s3 sync out/ s3://towtrace-dashboard-production --delete
   ```

4. **Invalidate CloudFront cache**:
   ```bash
   aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"
   ```

5. **Set up CI/CD with GitHub Actions**:
   - Create `.github/workflows/deploy-dashboard.yml`:
   ```yaml
   name: Deploy Dashboard
   
   on:
     push:
       branches:
         - master
       paths:
         - 'frontend/towtrace-dashboard-new/**'
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Set up Node.js
           uses: actions/setup-node@v3
           with:
             node-version: '18'
         - name: Install dependencies
           run: cd frontend/towtrace-dashboard-new && npm install
         - name: Build
           run: cd frontend/towtrace-dashboard-new && npm run build
         - name: Configure AWS
           uses: aws-actions/configure-aws-credentials@v1
           with:
             aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
             aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
             aws-region: us-east-1
         - name: Deploy to S3
           run: cd frontend/towtrace-dashboard-new && aws s3 sync out/ s3://towtrace-dashboard-production --delete
         - name: Invalidate CloudFront
           run: aws cloudfront create-invalidation --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} --paths "/*"
   ```

## Mobile App Deployment

### Configure Mobile Apps for Production

1. **Update API endpoint configuration**:
   - In both mobile apps, update the API configuration:
   ```typescript
   // TowTraceDriverApp-New/services/apiConfig.ts
   // TowTraceDispatchApp-New/services/apiConfig.ts
   
   export const API_BASE_URL = 'https://api.towtrace.com';
   export const AUTH_CONFIG = {
     clientId: '[GOOGLE-CLIENT-ID]',
     redirectUri: '[APP-SPECIFIC-REDIRECT-URI]'
   };
   ```

2. **Create production app icons and splash screens**:
   - Use `react-native-bootsplash` for splash screen
   - Use appropriate resolutions for app icons

3. **Update app version and build numbers**:
   - For Android, edit `android/app/build.gradle`:
   ```gradle
   versionCode 1
   versionName "1.0.0"
   ```
   
   - For iOS, update in Xcode project settings

### Android App Deployment

1. **Generate signed APK**:
   ```bash
   cd mobile/TowTraceDriverApp-New
   # Create keystore if not already created
   keytool -genkey -v -keystore towtrace-driver.keystore -alias towtrace-driver -keyalg RSA -keysize 2048 -validity 10000
   
   # Build signed APK
   cd android
   ./gradlew assembleRelease
   ```

2. **Create Play Store listing**:
   - Log in to Google Play Console
   - Create new application
   - Fill in all required metadata:
     - App title: "TowTrace Driver"
     - Short description
     - Full description
     - Screenshots (at least 2 for each supported device)
     - Feature graphic
     - Privacy policy URL
   
3. **Upload APK to Play Store**:
   - Internal testing track first
   - Gather feedback and confirm functionality
   - Promote to production when ready

4. **Repeat for Dispatcher app**:
   - Follow the same steps but with appropriate naming
   - App title: "TowTrace Dispatch"

### iOS App Deployment

1. **Configure iOS project for distribution**:
   ```bash
   cd mobile/TowTraceDriverApp-New/ios
   pod install
   open TowTraceDriverApp.xcworkspace
   ```

2. **In Xcode**:
   - Select the project
   - Go to Signing & Capabilities
   - Select your Apple Developer Team
   - Set provisioning profile to Distribution

3. **Build archive**:
   - Select Product > Archive
   - Wait for build to complete

4. **Upload to App Store Connect**:
   - In Xcode Organizer, select the archive
   - Click "Distribute App"
   - Follow the wizard to upload to App Store

5. **Configure App Store listing**:
   - App title: "TowTrace Driver"
   - Description
   - Keywords
   - Support URL
   - Marketing URL
   - Privacy Policy URL
   - Screenshots (various device sizes)
   - App icon

6. **Repeat for Dispatcher app**:
   - Follow the same steps with appropriate naming
   - App title: "TowTrace Dispatch"

## Monitoring and Maintenance

### CloudWatch Setup

1. **Set up CloudWatch dashboard**:
   ```bash
   aws cloudwatch put-dashboard --dashboard-name "TowTrace" --dashboard-body '{
     "widgets": [
       {
         "type": "metric",
         "x": 0,
         "y": 0,
         "width": 12,
         "height": 6,
         "properties": {
           "metrics": [
             [ "AWS/CloudFront", "Requests", "DistributionId", "[DISTRIBUTION-ID]", { "stat": "Sum" } ]
           ],
           "view": "timeSeries",
           "region": "us-east-1",
           "title": "CloudFront Requests",
           "period": 300
         }
       }
     ]
   }'
   ```

2. **Set up CloudWatch alarms**:
   ```bash
   aws cloudwatch put-metric-alarm --alarm-name "HighErrorRate" \
     --metric-name "5xxErrorRate" --namespace "AWS/CloudFront" \
     --statistic "Average" --period 300 --threshold 5 \
     --comparison-operator "GreaterThanThreshold" \
     --dimensions Name=DistributionId,Value=[DISTRIBUTION-ID] \
     --evaluation-periods 2 --alarm-actions [SNS-TOPIC-ARN]
   ```

### Cloudflare Monitoring

1. **Set up Cloudflare Analytics**:
   - Enable GraphQL Analytics API
   - Monitor Worker performance
   - Set up notifications for anomalies

2. **Configure Worker logs**:
   - Enable tail logs for debugging
   - Store logs in Cloudflare Logs

### Error Tracking and Performance Monitoring

1. **Implement Sentry integration** (or similar service):
   - Dashboard:
   ```bash
   npm install @sentry/nextjs
   ```
   
   - Mobile apps:
   ```bash
   npm install @sentry/react-native
   ```

2. **Configure application monitoring**:
   - Track API performance
   - Monitor client-side errors
   - Set up alerting for critical issues

## Security Considerations

### SSL/TLS Configuration

1. **Force HTTPS for all resources**:
   - Configure CloudFront to redirect HTTP to HTTPS
   - Set HSTS headers
   
2. **Configure security headers**:
   - In CloudFront Function or Lambda@Edge:
   ```javascript
   function handler(event) {
     var response = event.response;
     var headers = response.headers;
     
     // Set security headers
     headers['strict-transport-security'] = { value: 'max-age=31536000; includeSubDomains; preload' };
     headers['x-content-type-options'] = { value: 'nosniff' };
     headers['x-frame-options'] = { value: 'DENY' };
     headers['x-xss-protection'] = { value: '1; mode=block' };
     headers['referrer-policy'] = { value: 'same-origin' };
     headers['content-security-policy'] = { value: "default-src 'self'; /* add more directives */" };
     
     return response;
   }
   ```

### Data Protection

1. **Setup backup routines**:
   ```bash
   # Script to export D1 database (using Cloudflare API)
   curl -X POST "https://api.cloudflare.com/client/v4/accounts/[ACCOUNT-ID]/d1/database/[DATABASE-ID]/export" \
     -H "Authorization: Bearer [API-TOKEN]" \
     -H "Content-Type: application/json"
   ```

2. **Store backup files in encrypted S3 bucket**:
   ```bash
   aws s3 cp backup.sql s3://towtrace-backups/ --sse aws:kms
   ```

3. **Set up S3 lifecycle policy for backup retention**:
   ```bash
   aws s3api put-bucket-lifecycle-configuration --bucket towtrace-backups --lifecycle-configuration '{
     "Rules": [
       {
         "ID": "Delete old backups",
         "Status": "Enabled",
         "Prefix": "daily/",
         "Expiration": {
           "Days": 30
         }
       }
     ]
   }'
   ```

### Access Control

1. **Set up AWS IAM roles** with least privilege
2. **Implement IP restrictions** for admin access
3. **Enable multi-factor authentication** for all admin accounts

## Scaling Strategy

### Horizontal Scaling

1. **Cloudflare Workers** automatically scale:
   - No additional configuration needed
   
2. **CloudFront and S3** scale automatically:
   - Monitor performance during peak usage

3. **D1 Database scaling**:
   - Implement proper indexes
   - Monitor query performance
   - Consider sharding if needed in future

### Performance Optimization

1. **Implement proper caching strategy**:
   ```bash
   # Configure CloudFront cache behavior
   aws cloudfront update-distribution --id [DISTRIBUTION-ID] \
     --default-cache-behavior-forwarded-values="QueryString=true" \
     --default-cache-behavior-min-ttl=300 \
     --default-cache-behavior-default-ttl=3600 \
     --default-cache-behavior-max-ttl=86400
   ```

2. **Enable CloudFront compression**:
   - Compress text-based assets like HTML, CSS, and JavaScript

3. **Optimize mobile app performance**:
   - Use lazy loading
   - Implement efficient list rendering
   - Minimize unnecessary re-renders

## Rollback Procedures

### Web Dashboard Rollback

1. **Revert to previous deployment**:
   ```bash
   aws s3 sync s3://towtrace-dashboard-backup s3://towtrace-dashboard-production --delete
   aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"
   ```

2. **Create backup before each deployment**:
   ```bash
   aws s3 sync s3://towtrace-dashboard-production s3://towtrace-dashboard-backup --delete
   ```

### Backend Rollback

1. **Deploy previous version**:
   ```bash
   cd backend/towtrace-api
   git checkout [PREVIOUS-STABLE-TAG]
   npx wrangler deploy --env production
   ```

2. **Database rollback**:
   - Restore from most recent backup
   ```bash
   npx wrangler d1 execute towtrace-production --file=./backup.sql
   ```

### Mobile App Rollback

1. **Play Store**:
   - In Google Play Console, select previous version and roll back

2. **App Store**:
   - In App Store Connect, remove current version from sale
   - The previous version will automatically become available

## Troubleshooting Guide

### Common Issues and Solutions

1. **CloudFront serving stale content**:
   ```bash
   aws cloudfront create-invalidation --distribution-id [DISTRIBUTION-ID] --paths "/*"
   ```

2. **Database connectivity issues**:
   - Check Cloudflare Worker logs
   - Verify network connectivity
   - Confirm database binding configuration

3. **Mobile app crashes**:
   - Check crash reports in App Store Connect/Google Play Console
   - Update emergency hot fix if needed

---

## Launch Checklist

Before making the application publicly available, verify:

1. **Functionality**:
   - [ ] All critical user flows work in production environment
   - [ ] Authentication works properly
   - [ ] Data synchronization between mobile apps and backend works
   - [ ] Offline functionality works as expected

2. **Performance**:
   - [ ] Page load time < 3 seconds
   - [ ] API response time < 500ms
   - [ ] No memory leaks in mobile apps

3. **Security**:
   - [ ] All endpoints require authentication
   - [ ] Data is properly encrypted
   - [ ] No sensitive information is exposed

4. **Compliance**:
   - [ ] Privacy policy is published
   - [ ] Terms of service are published
   - [ ] FMCSA compliance features are validated

5. **Meta**:
   - [ ] SEO optimization is complete
   - [ ] Analytics tracking is implemented
   - [ ] Error monitoring is configured
   - [ ] Backup systems are verified

Once all items are checked, the application can be officially launched.