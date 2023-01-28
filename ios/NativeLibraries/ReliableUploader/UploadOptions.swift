import Foundation

@objc(UploadOptions)
class UploadOptions: NSObject {
  var url: String
  var method: String
  var filePath: String
  var field: String
  var headers: [String: String]?
  
  @objc init(url: String, method: String, filePath: String, field: String, headers: [String: String]?) {
    self.url = url
    self.method = method
    self.filePath = filePath
    self.field = field
    self.headers = headers
  }
}
