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
        filePath: optionsDict?["filePath"] as? String ?? "",
        field: optionsDict?["field"] as? String ?? "",
        headers: headers as? [String: String]
      );
      
      optionsResult.append(options)
    }

    return optionsResult
  }
  
  static func moveAssetToFile(localIdentifier: String) async -> String {
    let asset = PHAsset.fetchAssets(withLocalIdentifiers: [localIdentifier], options: nil).firstObject
    
    let resourceManager = PHAssetResourceManager.default()
    let resource = PHAssetResource.assetResources(for: asset!).first!
    
    let fileName = resource.originalFilename
    var filePath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)

    do {
      try await resourceManager.writeData(for: resource, toFile: filePath, options: nil)
    } catch {
      let options = PHContentEditingInputRequestOptions()
      options.isNetworkAccessAllowed = true

      asset?.requestContentEditingInput(with: options) { (contentEditingInput, info) in
        let imageURL = contentEditingInput?.fullSizeImageURL
        filePath = imageURL?.absoluteURL ?? imageURL ?? filePath
      }
    }
    
    return filePath.absoluteString
  }
  
  static func getFileInfo(filePath: String) async -> AssetFileInfo {
    let fileManager = FileManager()
    let attributes = try! fileManager.attributesOfItem(atPath: filePath)
    
    return AssetFileInfo(
      fileName: (filePath as NSString).lastPathComponent,
      fileSize: attributes[FileAttributeKey.size] as! UInt64? ?? 0,
      creationDate: attributes[FileAttributeKey.creationDate] as! Date? ?? Date(timeIntervalSince1970: 0),
      filePath: filePath
    )
  }
}
