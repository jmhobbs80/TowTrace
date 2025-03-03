// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';

// Mock QuickBooks implementation for development
// In production, you would use: import QuickBooks from 'node-quickbooks';

// Mock QuickBooks class for development
class MockQuickBooks {
  constructor(clientId, clientSecret, token, tokenSecret, realmId, useSandbox, debug, minorVersion, oauthVersion, redirectUrl) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUrl = redirectUrl;
    this.useSandbox = useSandbox;
    this.realmId = realmId;
  }

  createToken(code, callback) {
    // Mock token creation
    callback(null, {
      access_token: 'mock_access_token_' + this.realmId,
      refresh_token: 'mock_refresh_token_' + this.realmId,
      token_type: 'bearer',
      expires_in: 3600
    });
  }
}

/**
 * Handles callback from QuickBooks OAuth flow
 * Exchanges code for access token and saves credentials
 */
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get('code');
    const realmId = url.searchParams.get('realmId');
    const state = url.searchParams.get('state');
    
    // Verify state to prevent CSRF
    if (state \!== 'towtrace-state') {
      throw new Error('Invalid state parameter');
    }
    
    // Create QuickBooks connection
    const qbo = new MockQuickBooks(
      process.env.QUICKBOOKS_CLIENT_ID,
      process.env.QUICKBOOKS_CLIENT_SECRET,
      '', // OAuth token (will be obtained through exchange)
      false, // token_secret (not used with OAuth 2.0)
      realmId,
      process.env.QUICKBOOKS_SANDBOX === 'true', // use sandbox
      false, // debug
      null, // minor version
      '2.0', // OAuth version
      process.env.QUICKBOOKS_REDIRECT_URI // redirect url
    );
    
    // Exchange code for token
    const tokenResponse = await new Promise((resolve, reject) => {
      qbo.createToken(code, (err, token) => {
        if (err) {
          reject(err);
        } else {
          resolve(token);
        }
      });
    });
    
    // In a real application, you would save these credentials
    // to a database associated with the current user
    console.log('QuickBooks token obtained:', tokenResponse);
    
    // Redirect back to dashboard
    return NextResponse.redirect(new URL('/dashboard/finance', req.url));
  } catch (error) {
    console.error('QuickBooks callback error:', error);
    
    // In development mode, provide helpful message
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.json({ 
        error: 'QuickBooks callback error', 
        message: 'Error during OAuth callback processing', 
        details: error instanceof Error ? error.message : String(error) 
      }, { status: 500 });
    }
    
    // In production, redirect to error page
    return NextResponse.redirect(new URL('/error?code=qb_callback', req.url));
  }
}
