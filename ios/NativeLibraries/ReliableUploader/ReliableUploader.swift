import Foundation
import Photos

@objc(UploadOptions)
class UploadOptions: NSObject {
  var url: String
	var method: String
	var fileId: String
	var field: String
	var headers: [String: String]?
	
	@objc init(url: String, method: String, fileId: String, field: String, headers: [String: String]?) {
		self.url = url
		self.method = method
		self.fileId = fileId
		self.field = field
		self.headers = headers
	}
}

@objc(ReliableUploader)
class ReliableUploader: NSObject, URLSessionTaskDelegate {
	static let instance = ReliableUploader()

	var items: [UploadOptions] = []
	var session: URLSession? = nil

  func urlSession(_ session: URLSession, task: URLSessionTask, didSendBodyData bytesSent: Int64, totalBytesSent: Int64, totalBytesExpectedToSend: Int64) {
    let uploadProgress = Float(totalBytesSent) / Float(totalBytesExpectedToSend)
    let uploadProgressPercent = Int(uploadProgress * 100)
    
    NSLog("RNReliableUploader \(task.taskDescription ?? "NIL") progress \(uploadProgressPercent)%")
  }

	@objc static func requiresMainQueueSetup() -> Bool {
  	return false
	}
  
  @objc func uploadItems(_ itemsToUpload: [NSDictionary]) {
    var items: [UploadOptions] = []
    
    for dictionary in itemsToUpload {
      let optionsDict = dictionary as? [String:String]
			let headers = optionsDict?["headers"] as? [String: String]
      
      let options = UploadOptions(
        url: optionsDict?["url"] ?? "",
        method: optionsDict?["method"] ?? "",
        fileId: optionsDict?["fileId"] ?? "",
        field: optionsDict?["field"] ?? "",
        headers: headers
      );
      
      items.append(options)
    }
		
		let identifier = "com.reliableuploader"
		let configuration = URLSessionConfiguration.background(withIdentifier: identifier)
		
    session = URLSession(configuration: configuration, delegate: self, delegateQueue: nil)

    var uploadTasks: [URLSessionUploadTask] = []
		for item in items {
			let task = upload(item: item)

      if (task != nil) {
        uploadTasks.append(task!)
      }
		}

    for task in uploadTasks {
      task.resume()
    }
	}

  func upload(item: UploadOptions) -> URLSessionUploadTask? {
		let url = URL(string: item.url)!
    let asset = PHAsset.fetchAssets(withLocalIdentifiers: [item.fileId], options: nil).firstObject
    let resourceManager = PHAssetResourceManager.default()
    let resource = PHAssetResource.assetResources(for: asset!).first!
    let fileName = resource.originalFilename
    let fileLocalPath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)

    resourceManager.writeData(for: resource, toFile: fileLocalPath, options: nil, completionHandler: {error in
      if error == nil {
        NSLog("RNReliableUploader \(fileLocalPath) written")
      }
    })

    // log file name and path
    NSLog("RNReliableUploader - \(fileName) \(fileLocalPath)")

		var request = URLRequest(url: url, timeoutInterval: 60 * 60 * 24)
		request.httpMethod = item.method
    request.allHTTPHeaderFields = item.headers
		request.setValue("form-data; name=\"\(item.field)\"; filename=\"\(fileName)\"", forHTTPHeaderField: "Content-Disposition")

    let task = session?.uploadTask(with: request, fromFile: fileLocalPath)
    task?.taskDescription = item.fileId
    
    return task
	}
}
