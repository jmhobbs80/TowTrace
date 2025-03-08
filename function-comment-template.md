# TowTrace Function Comment Template

Use this template to add proper documentation to all functions in the TowTrace project. Every function must have a comment block that explains its purpose, parameters, and return values.

## Basic Function Comment Template

```typescript
/**
 * [FUNCTION NAME] - [BRIEF DESCRIPTION]
 * 
 * [DETAILED DESCRIPTION - What does this function do and why?]
 * 
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * ...
 * @returns {[TYPE]} [DESCRIPTION]
 * 
 * @example
 * // Example usage of the function
 * const result = functionName(param1, param2);
 */
```

## React Component Comment Template

```typescript
/**
 * [COMPONENT NAME]
 * 
 * [DETAILED DESCRIPTION - What does this component do and when should it be used?]
 * 
 * @param {[TYPE]} [PROP_NAME] - [DESCRIPTION]
 * @param {[TYPE]} [PROP_NAME] - [DESCRIPTION]
 * ...
 * @returns {JSX.Element} [DESCRIPTION]
 * 
 * @example
 * // Example usage of the component
 * <ComponentName prop1={value1} prop2={value2} />
 */
```

## React Hook Comment Template

```typescript
/**
 * [HOOK NAME]
 * 
 * [DETAILED DESCRIPTION - What does this hook do and when should it be used?]
 * 
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * ...
 * @returns {[TYPE]} [DESCRIPTION OF RETURN VALUES]
 * 
 * @example
 * // Example usage of the hook
 * const result = useHookName(param1, param2);
 */
```

## API Endpoint Handler Comment Template

```typescript
/**
 * [ENDPOINT HANDLER NAME]
 * 
 * [DETAILED DESCRIPTION - What does this endpoint do?]
 * 
 * @route [HTTP_METHOD] [ROUTE_PATH]
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * ...
 * @returns {[TYPE]} [DESCRIPTION]
 * @throws {[ERROR_TYPE]} [DESCRIPTION] - [WHEN THIS ERROR OCCURS]
 * 
 * @example
 * // Example request
 * fetch('/api/route', { 
 *   method: 'POST',
 *   body: JSON.stringify({ ... })
 * });
 * 
 * // Example response
 * {
 *   "status": "success",
 *   "data": { ... }
 * }
 */
```

## Class Method Comment Template

```typescript
/**
 * [METHOD NAME]
 * 
 * [DETAILED DESCRIPTION - What does this method do?]
 * 
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * @param {[TYPE]} [PARAM_NAME] - [DESCRIPTION]
 * ...
 * @returns {[TYPE]} [DESCRIPTION]
 * @throws {[ERROR_TYPE]} [DESCRIPTION] - [WHEN THIS ERROR OCCURS]
 * 
 * @example
 * // Example usage of the method
 * const instance = new ClassName();
 * const result = instance.methodName(param1, param2);
 */
```

## Important Guidelines

1. All functions should have a clear, concise description
2. All parameters should be documented with their types and descriptions
3. Return values should be documented with types and descriptions
4. Include examples whenever possible
5. Document any errors that may be thrown
6. For complex functions, include a more detailed description of the algorithm or logic
7. Keep comments up to date when function behavior changes