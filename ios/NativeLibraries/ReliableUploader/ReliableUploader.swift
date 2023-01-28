import Foundation
import Photos
import CryptoKit

@objc(ReliableUploader)
class ReliableUploader: NSObject, URLSessionTaskDelegate {
  let sessionId = "com.bd-dm.homecloud"
  
  private lazy var session: URLSession = {
    let configuration = URLSessionConfiguration.background(withIdentifier: sessionId)
    
    configuration.isDiscretionary = false
    configuration.allowsExpensiveNetworkAccess = true
    configuration.shouldUseExtendedBackgroundIdleMode = true
    configuration.sessionSendsLaunchEvents = true
    
    return URLSession(configuration: configuration, delegate: self, delegateQueue: nil)
  }()
  
  @objc static func requiresMainQueueSetup() -> Bool {
    return false
  }

  func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64, totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
    if (bytesSent != totalBytesExpectedToSend) {
      return
    }
    
    NSLog("RNReliableUploader: task \(task.taskDescription ?? "NIL")")
  }
  
  @objc func getFileHash(_ fileId: String, resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock)  {
    Task {
      let fileUrl = await ReliableUploaderHelpers.getAssetFilePath(localIdentifier: fileId)
      let data = try! Data(contentsOf: fileUrl)
      
      let hashed = SHA256.hash(data: data as NSData)
      let hashString = hashed.compactMap { String(format: "%02x", $0) }.joined()
      
      resolver(hashString)
    }
  }
  
  @objc func uploadItems(_ optionsDictionary: [NSDictionary], resolver: @escaping RCTPromiseResolveBlock, rejecter: @escaping RCTPromiseRejectBlock) {
    let itemsToUpload = ReliableUploaderHelpers.dictionaryToOptionsArray(optionsDictionary)
    
    Task {
      for item in itemsToUpload {
        await addUploadTask(options: item)
      }
      resolver(true)
    }
	}

  func addUploadTask(options: UploadOptions) async {
    let url = URL(string: options.url)!
    let fileUrl = await ReliableUploaderHelpers.getAssetFilePath(localIdentifier: options.fileId)
    let assetFileInfo = await ReliableUploaderHelpers.getFileInfo(filePath: fileUrl.path)
    
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "EEEE, dd LLL yyyy HH:mm:ss zzz"
    let lastModified = dateFormatter.string(from: assetFileInfo.creationDate)
    
		var request = URLRequest(url: url, timeoutInterval: 60 * 60 * 24)
		request.httpMethod = options.method
    request.allHTTPHeaderFields = options.headers
    request.setValue("attachment; filename=\"\(assetFileInfo.fileName)\"", forHTTPHeaderField: "Content-Disposition")
    request.setValue(lastModified, forHTTPHeaderField: "Last-Modified")

    let task = session.uploadTask(with: request, fromFile: fileUrl)
    task.countOfBytesClientExpectsToSend = Int64(Double(assetFileInfo.fileSize))
    task.taskDescription = options.fileId
    task.resume()
	}
}
