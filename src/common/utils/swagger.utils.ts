/**
 * SPDX-License-Identifier: UNLICENSED
 * Copyright: Proprietary
 */

/**
 * Utility function to include all models in a module for Swagger documentation
 * This avoids having to manually list each model in the extraModels array
 * @param models Array of model classes to include
 * @returns The array of model classes for Swagger extraModels
 */
export function getSwaggerModels<T extends any[]>(...models: T): T {
  return models;
}

/**
 * Collects all DTO models from a module for Swagger documentation
 * @param moduleExports Object containing all exports from a module
 * @returns Array of model classes
 */
export function collectDtoModels(moduleExports: Record<string, any>): any[] {
  const result: any[] = [];
  
  for (const key in moduleExports) {
    const exportedItem = moduleExports[key];
    
    // Check if it's a class (constructor function)
    if (typeof exportedItem === 'function' && 
        /Dto$/.test(key) && // Ends with "Dto"
        exportedItem.prototype) {
      result.push(exportedItem);
    }
  }
  
  return result;
}