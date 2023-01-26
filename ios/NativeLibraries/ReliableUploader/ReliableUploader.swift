import Foundation
import Photos

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
    
    NSLog("RNReliableUploader: task \(task.taskDescription ?? "NIL") finished")
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
    let (fileName, fileSize, fileCreationDate, fileLocalPath) = await ReliableUploaderHelpers.getAssetData(localIdentifier: options.fileId)
    
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "EEEE, dd LLL yyyy HH:mm:ss zzz"
    let lastModified = dateFormatter.string(from: fileCreationDate ?? Date(timeIntervalSince1970: 0))
    
		var request = URLRequest(url: url, timeoutInterval: 60 * 60 * 24)
		request.httpMethod = options.method
    request.allHTTPHeaderFields = options.headers
    request.setValue("attachment; filename=\"\(fileName)\"", forHTTPHeaderField: "Content-Disposition")
    request.setValue(lastModified, forHTTPHeaderField: "Last-Modified")

    let task = session.uploadTask(with: request, fromFile: fileLocalPath)
    if (fileSize != nil) {
      task.countOfBytesClientExpectsToSend = Int64(Double(fileSize!))
    }
    task.taskDescription = options.fileId
	}
}
