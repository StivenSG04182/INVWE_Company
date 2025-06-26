"use server";

import { Invoice } from "@prisma/client";
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { XMLBuilder, XMLParser } from 'fast-xml-parser';
import { format } from 'date-fns';

// Interfaz para la configuración DIAN
interface DianConfig {
  id: string;
  agencyId: string;
  issuerNIT: string;
  issuerName: string;
  softwareID: string;
  technicalKey: string;
  testSetId?: string;
  environment: 'PRODUCTION' | 'TESTING';
  certificatePath?: string;
  certificatePassword?: string;
  apiUrl?: string;
  apiUsername?: string;
  apiPassword?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Genera el XML para un documento electrónico según formato UBL 2.1 requerido por la DIAN
 */
export const generateElectronicDocumentXML = async (invoice: Invoice, dianConfig: DianConfig): Promise<string> => {
  try {
    // Obtener fecha y hora actual en formato ISO
    const currentDate = new Date();
    const issueDate = format(currentDate, 'yyyy-MM-dd');
    const issueTime = format(currentDate, 'HH:mm:ss');
    
    // Crear estructura básica del XML según UBL 2.1
    const invoiceXML = {
      '?xml': { '@_version': '1.0', '@_encoding': 'UTF-8' },
      'Invoice': {
        '@_xmlns': 'urn:oasis:names:specification:ubl:schema:xsd:Invoice-2',
        '@_xmlns:cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
        '@_xmlns:cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        '@_xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
        '@_xmlns:ext': 'urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2',
        '@_xmlns:sts': 'dian:gov:co:facturaelectronica:Structures-2-1',
        '@_xmlns:xades': 'http://uri.etsi.org/01903/v1.3.2#',
        '@_xmlns:xades141': 'http://uri.etsi.org/01903/v1.4.1#',
        '@_xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        
        // UBLExtensions (para firma digital y otros elementos DIAN)
        'ext:UBLExtensions': {
          'ext:UBLExtension': [
            {
              'ext:ExtensionContent': {
                // Aquí irá la firma digital después
                'sts:DianExtensions': {
                  'sts:InvoiceControl': {
                    'sts:InvoiceAuthorization': (invoice as any).invoiceResolution || '',
                    'sts:AuthorizationPeriod': {
                      'cbc:StartDate': issueDate,
                      'cbc:EndDate': format(new Date(currentDate.getFullYear() + 1, currentDate.getMonth(), currentDate.getDate()), 'yyyy-MM-dd')
                    },
                    'sts:AuthorizedInvoices': {
                      'sts:Prefix': (invoice as any).invoicePrefix || '',
                      'sts:From': '1',
                      'sts:To': '100000' // Rango autorizado
                    }
                  },
                  'sts:InvoiceSource': {
                    'cbc:IdentificationCode': { '@_listAgencyID': '6', '@_listAgencyName': 'United Nations Economic Commission for Europe', '@_listSchemeURI': 'urn:oasis:names:specification:ubl:codelist:gc:CountryIdentificationCode-2.1', '#text': 'CO' }
                  },
                  'sts:SoftwareProvider': {
                    'sts:ProviderID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': dianConfig.issuerNIT.slice(-1), '@_schemeName': '31', '#text': dianConfig.issuerNIT },
                    'sts:SoftwareID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '#text': dianConfig.softwareID }
                  },
                  'sts:SoftwareSecurityCode': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '#text': calculateSoftwareSecurityCode(dianConfig.softwareID, dianConfig.technicalKey) },
                  'sts:AuthorizationProvider': {
                    'sts:AuthorizationProviderID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': '4', '@_schemeName': '31', '#text': '800197268' }
                  },
                  'sts:QRCode': (invoice as any).qrCode
                }
              }
            },
            {
              'ext:ExtensionContent': {
                // Espacio reservado para la firma digital
                'ds:Signature': { '@_Id': 'xmldsig-' + crypto.randomUUID() }
              }
            }
          ]
        },
        
        // Información básica de la factura
        'cbc:UBLVersionID': '2.1',
        'cbc:CustomizationID': '10',
        'cbc:ProfileID': 'DIAN 2.1',
        'cbc:ProfileExecutionID': dianConfig.environment === 'PRODUCTION' ? '1' : '2',
        'cbc:ID': invoice.invoiceNumber,
        'cbc:UUID': { '@_schemeID': '2', '@_schemeName': 'CUFE-SHA384', '#text': (invoice as any).cufe },
        'cbc:IssueDate': issueDate,
        'cbc:IssueTime': issueTime,
        'cbc:InvoiceTypeCode': '01', // 01 = Factura de venta
        'cbc:DocumentCurrencyCode': { '@_listAgencyID': '6', '@_listAgencyName': 'United Nations Economic Commission for Europe', '@_listID': 'ISO 4217 Alpha', '#text': (invoice as any).currency || 'COP' },
        'cbc:LineCountNumeric': (invoice as any).Items?.length || 0,
        
        // Información del emisor
        'cac:AccountingSupplierParty': {
          'cbc:AdditionalAccountID': '1', // 1 = Persona jurídica
          'cac:Party': {
            'cac:PartyName': {
              'cbc:Name': dianConfig.issuerName
            },
            'cac:PhysicalLocation': {
              'cac:Address': {
                'cbc:ID': '11001', // Código DANE de Bogotá
                'cbc:CityName': 'Bogotá',
                'cbc:CountrySubentity': 'Bogotá D.C.',
                'cbc:CountrySubentityCode': '11',
                'cac:AddressLine': {
                  'cbc:Line': 'Dirección del emisor'
                },
                'cac:Country': {
                  'cbc:IdentificationCode': 'CO',
                  'cbc:Name': { '@_languageID': 'es', '#text': 'Colombia' }
                }
              }
            },
            'cac:PartyTaxScheme': {
              'cbc:RegistrationName': dianConfig.issuerName,
              'cbc:CompanyID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': dianConfig.issuerNIT.slice(-1), '@_schemeName': '31', '#text': dianConfig.issuerNIT },
              'cbc:TaxLevelCode': { '@_listName': 'No aplica', '#text': 'O-99' }, // Código de responsabilidad fiscal
              'cac:RegistrationAddress': {
                'cbc:ID': '11001',
                'cbc:CityName': 'Bogotá',
                'cbc:CountrySubentity': 'Bogotá D.C.',
                'cbc:CountrySubentityCode': '11',
                'cac:AddressLine': {
                  'cbc:Line': 'Dirección del emisor'
                },
                'cac:Country': {
                  'cbc:IdentificationCode': 'CO',
                  'cbc:Name': { '@_languageID': 'es', '#text': 'Colombia' }
                }
              },
              'cac:TaxScheme': {
                'cbc:ID': '01',
                'cbc:Name': 'IVA'
              }
            },
            'cac:PartyLegalEntity': {
              'cbc:RegistrationName': dianConfig.issuerName,
              'cbc:CompanyID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': dianConfig.issuerNIT.slice(-1), '@_schemeName': '31', '#text': dianConfig.issuerNIT },
              'cac:CorporateRegistrationScheme': {
                'cbc:ID': (invoice as any).invoicePrefix || '',
                'cbc:Name': ''
              }
            },
            'cac:Contact': {
              'cbc:ElectronicMail': 'contacto@empresa.com'
            }
          }
        },
        
        // Información del cliente
        'cac:AccountingCustomerParty': {
          'cbc:AdditionalAccountID': '2', // 2 = Persona natural
          'cac:Party': {
            'cac:PartyIdentification': {
              'cbc:ID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': '3', '@_schemeName': '13', '#text': (invoice as any).customerTaxId || '222222222222' }
            },
            'cac:PartyName': {
              'cbc:Name': (invoice as any).Customer?.name || 'Cliente Final'
            },
            'cac:PhysicalLocation': {
              'cac:Address': {
                'cbc:ID': '11001',
                'cbc:CityName': 'Bogotá',
                'cbc:CountrySubentity': 'Bogotá D.C.',
                'cbc:CountrySubentityCode': '11',
                'cac:AddressLine': {
                  'cbc:Line': (invoice as any).customerAddress || 'Dirección del cliente'
                },
                'cac:Country': {
                  'cbc:IdentificationCode': 'CO',
                  'cbc:Name': { '@_languageID': 'es', '#text': 'Colombia' }
                }
              }
            },
            'cac:PartyTaxScheme': {
              'cbc:RegistrationName': (invoice as any).Customer?.name || 'Cliente Final',
              'cbc:CompanyID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': '3', '@_schemeName': '13', '#text': (invoice as any).customerTaxId || '222222222222' },
              'cbc:TaxLevelCode': { '@_listName': 'No aplica', '#text': 'R-99-PN' },
              'cac:RegistrationAddress': {
                'cbc:ID': '11001',
                'cbc:CityName': 'Bogotá',
                'cbc:CountrySubentity': 'Bogotá D.C.',
                'cbc:CountrySubentityCode': '11',
                'cac:AddressLine': {
                  'cbc:Line': (invoice as any).customerAddress || 'Dirección del cliente'
                },
                'cac:Country': {
                  'cbc:IdentificationCode': 'CO',
                  'cbc:Name': { '@_languageID': 'es', '#text': 'Colombia' }
                }
              },
              'cac:TaxScheme': {
                'cbc:ID': '01',
                'cbc:Name': 'IVA'
              }
            },
            'cac:PartyLegalEntity': {
              'cbc:RegistrationName': (invoice as any).Customer?.name || 'Cliente Final',
              'cbc:CompanyID': { '@_schemeAgencyID': '195', '@_schemeAgencyName': 'CO, DIAN (Dirección de Impuestos y Aduanas Nacionales)', '@_schemeID': '3', '@_schemeName': '13', '#text': (invoice as any).customerTaxId || '222222222222' }
            },
            'cac:Contact': {
              'cbc:ElectronicMail': (invoice as any).customerEmail || 'cliente@example.com'
            },
            'cac:Person': {
              'cbc:FirstName': (invoice as any).Customer?.name?.split(' ')[0] || 'Cliente',
              'cbc:FamilyName': (invoice as any).Customer?.name?.split(' ')[1] || 'Final'
            }
          }
        },
        
        // Información de pago
        'cac:PaymentMeans': {
          'cbc:ID': '1',
          'cbc:PaymentMeansCode': '10', // 10 = Efectivo
          'cbc:PaymentDueDate': (invoice as any).dueDate ? format(new Date((invoice as any).dueDate), 'yyyy-MM-dd') : issueDate
        },
        
        // Información de impuestos
        'cac:TaxTotal': {
          'cbc:TaxAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).tax.toString() },
          'cac:TaxSubtotal': {
            'cbc:TaxableAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).subtotal.toString() },
            'cbc:TaxAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).tax.toString() },
            'cac:TaxCategory': {
              'cbc:Percent': '19.00',
              'cac:TaxScheme': {
                'cbc:ID': '01',
                'cbc:Name': 'IVA'
              }
            }
          }
        },
        
        // Totales legales
        'cac:LegalMonetaryTotal': {
          'cbc:LineExtensionAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).subtotal.toString() },
          'cbc:TaxExclusiveAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).subtotal.toString() },
          'cbc:TaxInclusiveAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (Number((invoice as any).subtotal) + Number((invoice as any).tax)).toString() },
          'cbc:AllowanceTotalAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).discount.toString() },
          'cbc:PayableAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (invoice as any).total.toString() }
        },
        
        // Líneas de detalle
        'cac:InvoiceLine': (invoice as any).Items?.map((item, index) => ({
          'cbc:ID': (index + 1).toString(),
          'cbc:InvoicedQuantity': { '@_unitCode': 'EA', '#text': item.quantity.toString() },
          'cbc:LineExtensionAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (Number(item.unitPrice) * Number(item.quantity)).toString() },
          'cac:TaxTotal': {
            'cbc:TaxAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': item.tax.toString() },
            'cac:TaxSubtotal': {
              'cbc:TaxableAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': (Number(item.unitPrice) * Number(item.quantity)).toString() },
              'cbc:TaxAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': item.tax.toString() },
              'cac:TaxCategory': {
                'cbc:Percent': '19.00',
                'cac:TaxScheme': {
                  'cbc:ID': '01',
                  'cbc:Name': 'IVA'
                }
              }
            }
          },
          'cac:Item': {
            'cbc:Description': item.description || 'Producto o servicio',
            'cac:SellersItemIdentification': {
              'cbc:ID': item.productId
            }
          },
          'cac:Price': {
            'cbc:PriceAmount': { '@_currencyID': (invoice as any).currency || 'COP', '#text': item.unitPrice.toString() },
            'cbc:BaseQuantity': { '@_unitCode': 'EA', '#text': '1' }
          }
        })) || []
      }
    };
    
    // Convertir objeto a XML
    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      suppressEmptyNode: true
    });
    
    return builder.build(invoiceXML);
  } catch (error) {
    console.error('Error al generar XML de factura electrónica:', error);
    throw new Error('Error al generar XML de factura electrónica');
  }
};

/**
 * Firma un documento XML con el certificado digital
 */
export const signXmlDocument = async (xmlContent: string, dianConfig: DianConfig): Promise<string> => {
  try {
    // En un entorno real, aquí se utilizaría una biblioteca de firma digital
    // como xmldsigjs, node-signpdf o similar para firmar el XML con el certificado
    
    // Para esta implementación de ejemplo, simplemente simularemos la firma
    // añadiendo un nodo de firma con valores de ejemplo
    
    // Parsear el XML
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseAttributeValue: true
    });
    
    const xmlObj = parser.parse(xmlContent);
    
    // Buscar el nodo de firma y reemplazarlo con una firma simulada
    if (xmlObj.Invoice && xmlObj.Invoice['ext:UBLExtensions'] && 
        xmlObj.Invoice['ext:UBLExtensions']['ext:UBLExtension']) {
      
      // Encontrar el nodo de firma
      const extensions = xmlObj.Invoice['ext:UBLExtensions']['ext:UBLExtension'];
      for (let i = 0; i < extensions.length; i++) {
        if (extensions[i]['ext:ExtensionContent'] && 
            extensions[i]['ext:ExtensionContent']['ds:Signature']) {
          
          // Reemplazar con una firma simulada
          const signatureId = extensions[i]['ext:ExtensionContent']['ds:Signature']['@_Id'];
          extensions[i]['ext:ExtensionContent']['ds:Signature'] = {
            '@_Id': signatureId,
            '@_xmlns:ds': 'http://www.w3.org/2000/09/xmldsig#',
            'ds:SignedInfo': {
              'ds:CanonicalizationMethod': {
                '@_Algorithm': 'http://www.w3.org/TR/2001/REC-xml-c14n-20010315'
              },
              'ds:SignatureMethod': {
                '@_Algorithm': 'http://www.w3.org/2001/04/xmldsig-more#rsa-sha256'
              },
              'ds:Reference': {
                '@_Id': 'xmldsig-' + crypto.randomUUID(),
                '@_URI': '',
                'ds:Transforms': {
                  'ds:Transform': {
                    '@_Algorithm': 'http://www.w3.org/2000/09/xmldsig#enveloped-signature'
                  }
                },
                'ds:DigestMethod': {
                  '@_Algorithm': 'http://www.w3.org/2001/04/xmlenc#sha256'
                },
                'ds:DigestValue': crypto.createHash('sha256').update(xmlContent).digest('base64')
              }
            },
            'ds:SignatureValue': crypto.randomBytes(64).toString('base64'),
            'ds:KeyInfo': {
              'ds:X509Data': {
                'ds:X509Certificate': 'MIIGXTCCBUWgAwIBAgIQfJXEQP...'
              }
            }
          };
          break;
        }
      }
    }
    
    // Convertir de nuevo a XML
    const builder = new XMLBuilder({
      format: true,
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      suppressEmptyNode: true
    });
    
    return builder.build(xmlObj);
  } catch (error) {
    console.error('Error al firmar documento XML:', error);
    throw new Error('Error al firmar documento XML');
  }
};

/**
 * Envía un documento XML firmado a la DIAN
 */
export const sendDocumentToDian = async (signedXml: string, dianConfig: DianConfig): Promise<{
  status: string;
  signatureValue: string;
  acknowledgmentDate: Date;
}> => {
  try {
    // En un entorno real, aquí se haría una petición HTTP al servicio web de la DIAN
    // utilizando fetch, axios u otra biblioteca
    
    // Para esta implementación de ejemplo, simularemos una respuesta exitosa
    
    // Simular un retraso de red
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular respuesta de la DIAN
    return {
      status: 'ACEPTADO',
      signatureValue: crypto.randomBytes(64).toString('base64'),
      acknowledgmentDate: new Date()
    };
  } catch (error) {
    console.error('Error al enviar documento a DIAN:', error);
    throw new Error('Error al enviar documento a DIAN');
  }
};

/**
 * Genera una representación gráfica (PDF) del documento electrónico
 */
export const generateElectronicDocumentPDF = async (invoice: Invoice, dianConfig: DianConfig): Promise<string> => {
  try {
    // En un entorno real, aquí se utilizaría una biblioteca como PDFKit, jsPDF o similar
    // para generar un PDF con la representación gráfica de la factura
    
    // Para esta implementación de ejemplo, simularemos la generación del PDF
    // devolviendo una ruta de archivo
    
    const pdfFileName = `${invoice.documentType}_${invoice.invoiceNumber.replace(/\s/g, '_')}.pdf`;
    const pdfPath = `/temp/electronic_documents/${pdfFileName}`;
    
    // En un entorno real, aquí se generaría y guardaría el PDF
    
    return pdfPath;
  } catch (error) {
    console.error('Error al generar PDF de factura electrónica:', error);
    throw new Error('Error al generar PDF de factura electrónica');
  }
};

/**
 * Calcula el código de seguridad del software según especificación DIAN
 */
const calculateSoftwareSecurityCode = (softwareId: string, technicalKey: string): string => {
  // En producción, esto seguiría el algoritmo oficial DIAN
  const dataToHash = `${softwareId}${technicalKey}`;
  return crypto.createHash('sha384').update(dataToHash).digest('hex');
};