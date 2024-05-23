//
//  StringURLValidator.swift
//  CieID SDK
//
//  Created by Eros Brienza on 10/01/21.
//

import Foundation
import UIKit

//IDP ERROR PARAMETER
let ERROR_PARAMETER : String = "cieid_error_message"
//IDP URL COMPONENT
let IDP_URL_COMPONENT : String = "ios.idserver.servizicie.interno.gov.it"
//IDP URL RESPONSE COMPONENT
let IDP_URL_RESPONSE_COMPONENT : String = "idserver.servizicie.interno.gov.it"
//IDP RESPONSE PARAMETERS
let CODICE           =       "codice"
let LOGIN            =       "login"
let CONVERSATION     =       "conversation"

extension String {
    
    var containsValidSPUrl: Bool {
        
        //Se URL formattato correttamente
        if let url = URL(string: self) {
                
            //Return TRUE se URL è navigabile
            return UIApplication.shared.canOpenURL(url as URL)
                    
        }
            
        return false
        
    }
    
    var containsValidIdpUrl: Bool {
        
        //Contiene un IDP URL
        if self.contains(IDP_URL_COMPONENT){
            
            //Se URL formattato correttamente
            if let url = URL(string: self) {
                            
                //Return TRUE se URL è navigabile
                return UIApplication.shared.canOpenURL(url as URL)
                    
            }
            
        }
    
        return false
        
    }
    
    var containsValidIdpResponse: Bool {
        
        //Contiene un IDP URL
        if (self.contains(IDP_URL_RESPONSE_COMPONENT)){
        
            //Se URL formattato correttamente
            if let url = URL(string: self) {
                    
                //Estraggo i parametri
                let urlParameters = url.parametersFromQueryString ?? ["":""]

                //Verifico che contiene i parametri corretti
                if(urlParameters[CODICE] != nil && urlParameters[LOGIN] != nil && urlParameters[CONVERSATION] != nil){
                
                    //Verifico che i parametri non siano vuoti
                    if(urlParameters[CODICE]!.count > 0 && urlParameters[LOGIN]!.count > 0 && urlParameters[CONVERSATION]!.count > 0){
                        
                        //Verifico che non ci siano parametri non previsti
                        if(urlParameters.count == 3){
                            
                            //Return TRUE se URL è navigabile
                            return UIApplication.shared.canOpenURL(url as URL)
                            
                        }
                     
                    }
                
                }
                        
            }
            
        }
            
        return false
        
    }
    
    var responseError: String? {
        
        //Se URL formattato correttamente
        if let url = URL(string: self) {
                
            //Estraggo i parametri
            let urlParameters = url.parametersFromQueryString ?? ["":""]
            
            //Verifico che il campo d'errore esista
            if(urlParameters[ERROR_PARAMETER] != nil){
            
                //Verifico che il campo d'errore non sia vuoto
                if(urlParameters[ERROR_PARAMETER]!.count > 0){
                        
                    //Return Error Message
                    return urlParameters[ERROR_PARAMETER]
                    
                }else{
                    
                    //Return Error Message
                    return "Errore sconosciuto"
                    
                }
                
            }
                    
        }
            
        return nil
        
    }
    
}
