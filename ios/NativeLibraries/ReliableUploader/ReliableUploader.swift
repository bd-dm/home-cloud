import Foundation
import Photos

@objc(ReliableUploader)
class ReliableUploader: NSObject, URLSessionTaskDelegate {
  let sessionId = "com.bd-dm.homecloud"
  
  private lazy var session: URLSession = {
    let configuration = URLSessionConfiguration.background(withIdentifier: sessionId)
    
    configuration.isDiscretionary = true
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
    
    NSLog("RNReliableUploader \(task.taskDescription ?? "NIL") (\(totalBytesSent) / \(totalBytesExpectedToSend))")
    
    let urlPath: String = "http://192.168.0.103:8082/finished?id=\(task.taskDescription ?? "NIL")"
    let url = URL(string: urlPath)!
    let request = URLRequest(url: url)
    let connection = NSURLConnection(request: request, delegate: self)!
    connection.start()
  }
  
  @objc func uploadItems(_ optionsDictionary: [NSDictionary]) {
    let itemsToUpload = ReliableUploaderHelpers.dictionaryToOptionsArray(optionsDictionary)
    
    Task {
      for item in itemsToUpload {
        await addUploadTask(options: item)
      }
    }
    
	}

  func addUploadTask(options: UploadOptions) async {
		let url = URL(string: options.url)!
    let (fileName, fileSize, fileLocalPath) = await ReliableUploaderHelpers.getAssetData(localIdentifier: options.fileId)
    
		var request = URLRequest(url: url, timeoutInterval: 60 * 60 * 24)
		request.httpMethod = options.method
    request.allHTTPHeaderFields = options.headers
    request.setValue("attachment; filename=\"\(fileName)\"", forHTTPHeaderField: "Content-Disposition")

    let task = session.uploadTask(with: request, fromFile: fileLocalPath)
    if (fileSize != nil) {
      task.countOfBytesClientExpectsToSend = Int64(Double(fileSize!) * 1.5)
      NSLog("RNReliableUploader task.countOfBytesClientExpectsToSend \(task.countOfBytesClientExpectsToSend)")
    }
    task.taskDescription = options.fileId
    task.resume()
	}
}
