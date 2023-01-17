//
//  ReliableUploaderHelpers.swift
//  homecloud
//
//  Created by d.bardyshev on 17.01.2023.
//

import Foundation
import Photos

class ReliableUploaderHelpers: NSObject {
  static func dictionaryToOptionsArray(_ dictionary: [NSDictionary]) -> [UploadOptions] {
    var optionsResult: [UploadOptions] = []

    for dictionary in dictionary {
      let optionsDict = dictionary as? [String:Any]
      let headers = optionsDict?["headers"]
      
      let options = UploadOptions(
        url: optionsDict?["url"] as? String ?? "",
        method: optionsDict?["method"] as? String ?? "",
        fileId: optionsDict?["fileId"] as? String ?? "",
        field: optionsDict?["field"] as? String ?? "",
        headers: headers as? [String: String]
      );
      
      optionsResult.append(options)
    }

    return optionsResult
  }
  
  static func getAssetData(localIdentifier: String) async -> (String, UInt64?, URL) {
    let asset = PHAsset.fetchAssets(withLocalIdentifiers: [localIdentifier], options: nil).firstObject
    let resourceManager = PHAssetResourceManager.default()
    let resource = PHAssetResource.assetResources(for: asset!).first!
    let fileName = resource.originalFilename
    var fileLocalPath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)
    var fileSize: UInt64? = nil

    do {
      try await resourceManager.writeData(for: resource, toFile: fileLocalPath, options: nil)
    } catch {
      let options = PHContentEditingInputRequestOptions()
      options.isNetworkAccessAllowed = false

      asset?.requestContentEditingInput(with: options) { (contentEditingInput, info) in
        let imageURL = contentEditingInput?.fullSizeImageURL
        fileLocalPath = imageURL?.absoluteURL ?? imageURL ?? fileLocalPath
      }
    }
    
    let attributes = try? FileManager.default.attributesOfItem(atPath: fileLocalPath.path)
    if (attributes != nil) {
      fileSize = attributes![FileAttributeKey.size] as! UInt64?
    }
    
    return (fileName, fileSize, fileLocalPath)
  }
}
