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

  static func getAssetFilePath(localIdentifier: String) async -> URL
  {
    let assets = PHAsset.fetchAssets(withLocalIdentifiers: [localIdentifier], options: nil)
    let asset = assets.firstObject
    let resource = PHAssetResource.assetResources(for: asset!).first!
    let fileName = resource.originalFilename
    
    let options = PHContentEditingInputRequestOptions()
    options.isNetworkAccessAllowed = true
  
    if (resource.type == PHAssetResourceType.video) {
      let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
      let destURL = documentsURL.appendingPathComponent(fileName)
      if (FileManager.default.fileExists(atPath: destURL.path)) {
        return destURL
      }
      
      let fileUrl = await withUnsafeContinuation { continuation in
        PHImageManager.default().requestAVAsset(forVideo: asset!, options: nil) { (avAsset, audioMix, info) in
          let videoUrl = ((avAsset as! AVURLAsset).url as NSURL).fileReferenceURL()
          continuation.resume(returning: videoUrl)
        }
      }!
      
      try! FileManager.default.copyItem(at: fileUrl, to: destURL)
      
      return destURL
    } else {
      let documentsURL = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask).first!
      let destURL = documentsURL.appendingPathComponent(fileName)
      if (FileManager.default.fileExists(atPath: destURL.path)) {
        return destURL
      }
      
      let fileUrl = await withUnsafeContinuation { continuation in
        asset?.requestContentEditingInput(with: options) { (contentEditingInput, info) in
          let imageUrl = contentEditingInput?.fullSizeImageURL
          continuation.resume(returning: imageUrl!)
        }
      }
      
      try! FileManager.default.copyItem(at: fileUrl, to: destURL)
      
      return destURL
    }
  }
  
  static func getFileInfo(filePath: String) async -> AssetFileInfo {
    let fileManager = FileManager()
    let attributes = try! fileManager.attributesOfItem(atPath: filePath)
    
    return AssetFileInfo(
      fileName: (filePath as NSString).lastPathComponent,
      fileSize: attributes[FileAttributeKey.size] as! UInt64? ?? 0,
      creationDate: attributes[FileAttributeKey.creationDate] as! Date? ?? Date(timeIntervalSince1970: 0)
    )
  }
}
