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

export class FileResponseDto {
  'id': string;
  'fileHash': string;
  'fileUrl': string;
  'fileCreationDate': Date;
  'userId': string;
  'createdAt': Date;
  'updatedAt': Date;

  static readonly discriminator: string | undefined = undefined;

  static readonly attributeTypeMap: Array<{
    name: string;
    baseName: string;
    type: string;
    format: string;
  }> = [
    {
      name: 'id',
      baseName: 'id',
      type: 'string',
      format: '',
    },
    {
      name: 'fileHash',
      baseName: 'fileHash',
      type: 'string',
      format: '',
    },
    {
      name: 'fileUrl',
      baseName: 'fileUrl',
      type: 'string',
      format: '',
    },
    {
      name: 'fileCreationDate',
      baseName: 'fileCreationDate',
      type: 'Date',
      format: 'date-time',
    },
    {
      name: 'userId',
      baseName: 'userId',
      type: 'string',
      format: '',
    },
    {
      name: 'createdAt',
      baseName: 'createdAt',
      type: 'Date',
      format: 'date-time',
    },
    {
      name: 'updatedAt',
      baseName: 'updatedAt',
      type: 'Date',
      format: 'date-time',
    },
  ];

  static getAttributeTypeMap() {
    return FileResponseDto.attributeTypeMap;
  }

  public constructor() {}
}
