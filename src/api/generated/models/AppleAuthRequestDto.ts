/**
 * Home cloud API
 * No description provided (generated by Openapi Generator https://github.com/openapitools/openapi-generator)
 *
 * OpenAPI spec version: 1.0
 *
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import {HttpFile} from '../http/http';

export class AppleAuthRequestDto {
  'code': string;

  static readonly discriminator: string | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    {
      name: 'code',
      baseName: 'code',
      type: 'string',
      format: '',
    },
  ];

  static getAttributeTypeMap() {
    return AppleAuthRequestDto.attributeTypeMap;
  }

  public constructor() {}
}
