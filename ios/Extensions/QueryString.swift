//
//  QueryString.swift
//  sptester
//
//  Created by Eros Brienza on 15/01/21.
//

import Foundation

extension URL {
    
    public var parametersFromQueryString : [String: String]? {
        
        guard let components = URLComponents(url: self, resolvingAgainstBaseURL: true),
              let queryItems = components.queryItems else { return nil }
    
        return queryItems.reduce(into: [String: String]()) { (result, item) in
            
            result[item.name] = item.value
            
        }
        
    }
    
    func appendSourceAppParameter(sp_url_scheme: String) -> URL? {
        // Check if SP_URL key exists in info.plist
        let SP_URL_SCHEME : String = sp_url_scheme
        let SOURCE_APP : String = "sourceApp"
        return self.appendingPathComponent("&\(SOURCE_APP)=\(SP_URL_SCHEME)", isDirectory: false)
    }
    
    public var addAppDomainPrefix : URL?{
    
        let APP_DOMAIN : String = "CIEID://"
        let finalURL = URL.init(string: "\(APP_DOMAIN)\(self.absoluteString)")
        return finalURL
            
    }
    
}
