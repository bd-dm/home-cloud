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
    
    if (uploadProgressPercent == 100) {
      NSLog("RNReliableUploader uploaded \(task.taskDescription ?? "")")
    }
  }

	@objc static func requiresMainQueueSetup() -> Bool {
  	return false
	}
  
  @objc func uploadItems(_ itemsToUpload: [NSDictionary]) {
    Task {
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
        let task = await upload(item: item)
        
        if (task != nil) {
          uploadTasks.append(task!)
        }
      }
      
      for task in uploadTasks {
        task.resume()
      }
    }
	}

  func upload(item: UploadOptions) async -> URLSessionUploadTask? {
		let url = URL(string: item.url)!
    let asset = PHAsset.fetchAssets(withLocalIdentifiers: [item.fileId], options: nil).firstObject
    let resourceManager = PHAssetResourceManager.default()
    let resource = PHAssetResource.assetResources(for: asset!).first!
    let fileName = resource.originalFilename
    var fileLocalPath = URL(fileURLWithPath: NSTemporaryDirectory()).appendingPathComponent(fileName)

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

		var request = URLRequest(url: url, timeoutInterval: 60 * 60 * 24)
		request.httpMethod = item.method
    request.allHTTPHeaderFields = item.headers
    request.setValue(fileName, forHTTPHeaderField: "fileName")

    do {
      let task = try session?.uploadTask(with: request, fromFile: fileLocalPath)
      task?.taskDescription = item.fileId

      return task
    } catch {
      NSLog("RNReliableUploader error \(error)")
      return nil
    }
	}
}
