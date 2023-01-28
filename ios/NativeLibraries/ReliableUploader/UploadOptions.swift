import Foundation

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
