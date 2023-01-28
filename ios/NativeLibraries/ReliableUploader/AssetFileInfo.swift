//
//  AssetFileInfo.swift
//  homecloud
//
//  Created by d.bardyshev on 28.01.2023.
//

import Foundation

@objc(AssetFileInfo)
class AssetFileInfo: NSObject {
  var fileName: String
  var fileSize: UInt64
  var creationDate: Date
  
  
  @objc init(fileName: String, fileSize: UInt64, creationDate: Date){
    self.fileName = fileName
    self.fileSize = fileSize
    self.creationDate = creationDate
  }
}
