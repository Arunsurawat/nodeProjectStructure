import { NextFunction, Request, Response } from "express";
import { UploadedFile } from 'express-fileupload';
import Pdf2Json from 'pdf2json';
import multer from 'multer';
import pdfParse from 'pdf-parse';
import xmlbuilder from 'xmlbuilder';
import { parseString, Builder } from 'xml2js';
import * as fs from 'fs';
import * as xml2js from 'xml2js';
import * as util from 'util';

declare module 'express' {
    interface Request {
        file: { [key: string]: UploadedFile[] };
    }
}

class PdfToXmlController {
    public convertXml = async (req: Request, res: Response, next: NextFunction) => {
        try {
            // res.status(200).send("<h1>PDF TO XML</h1>")
            // console.log("REQ FILE 1 ========", req);
            console.log("REQ FILE 2 ========", req.file);
            const uploadedFile = req.file as UploadedFile;
            console.log({uploadedFile})
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No PDF file uploaded.' });
            }

            /*const pdfFile = fs.readFileSync(uploadedFile.path);
            pdfParse(pdfFile).then(function(data){
                console.log({data});
                const xml = createXML(data)
                console.log({xml})
                res.status(200).json({ xml });
            })
            
            
            function createXML(pdfData: any): string {
                const xmlBuilder = new Builder();
                const xmlObject = {
                    root: {
                        pages: []
                    }
                };

                if (pdfData && pdfData.formImage && pdfData.formImage.Pages) {
                    pdfData.formImage.Pages.forEach((page: any, pageIndex: number) => {
                        if (page && page.Texts) {
                            const pageObject = { page: { index: pageIndex + 1, texts: [] } };

                            page.Texts.forEach((text: any, textIndex: number) => {
                                const decodedText = Buffer.from(text.R[0].T, 'base64').toString('utf-8');
                                pageObject.page.texts.push({ index: textIndex + 1, content: decodedText });
                            });

                            xmlObject.root.pages.push(pageObject);
                        }
                    });
                }

                const xmlContent = xmlBuilder.buildObject(xmlObject);
                return xmlContent;
            }

            */
            // Check if the file exists
            // Check if the file exists
            fs.access(uploadedFile.path, fs.constants.F_OK, (err) => {
                if (err) {
                    console.error('The file does not exist.');
                    return;
                }

                // Convert the PDF to text
                fs.readFile(uploadedFile.path, (err, buffer) => {
                    if (err) {
                        console.error('Error during conversion:', err);
                        return;
                    }
                    console.log({ buffer })
                    pdfParse(buffer).then((data) => {
                        // Extract the text from the PDF data
                        const text = data.text;
                        console.log({ text })
                        console.log('#################', data)
                        /* Convert the extracted text to XML
                             const xml = '<root>' + text.split('\n').join('</root><root>') + '</root>';
                             const xml = `
                             <?xml version="1.0" encoding = "UTF-8" ?>
                                 <note>
                                 <to>${data.info.Title} < /to>
                                 < from > ${data.info.Creator} < /from>
                                 < heading >${data.info.Title}< /heading>
                                 < body > ${data.text}</body>
                           < /note>`
                        */
                        /* approach 2 
                        const xml = `
                            <?xml version="1.0" encoding="UTF-8" ?>
                                <!DOCTYPE iccxml SYSTEM "iccxml.dtd">
                                    <iccxml xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" xmlns:m="http://www.w3.org/1998/Math/MathML">
                                        <head>
                                        <title>${data.info.Title} </title>
                                            <link href="newICCStylesheet.css" rel="Stylesheet" type="text/css"/>
                                        </head>
                                        <body epub:type="bodymatter">${data.text}</body>
                            </iccxml>`;
                            console.log({ xml });
                        
                        */
                        /*Save the XML to a file
                        fs.writeFile('uploads/xml-file.xml', xml, (err) => {
                            if (err) {
                                console.error('Error while saving the XML file:', err);
                                return;
                            }

                            console.log('The PDF has been successfully converted to XML and saved.');
                        });
                        res.status(200).send(xml) */
                    });
                });
            });

        } catch (error) {
            next(error);
        }
    };
    
    public createXml = (req: Request, res: Response, next: NextFunction) => {
        try {
            // res.status(200).send("<h1>PDF TO XML</h1>")
            // console.log("REQ FILE 1 ========", req);
            console.log("REQ FILE 2 ========", req.file);
            const uploadedFile = req.file as UploadedFile;
            if (!uploadedFile) {
                return res.status(400).json({ error: 'No  file uploaded.' });
            }
            console.log({ uploadedFile })
            
            
            //first way
            
            const readFile = util.promisify(fs.readFile);
            const writeFile = util.promisify(fs.writeFile);
            
            async function readAndUpdateXml(filePath: string, tagName: string, newValue: string): Promise<void> {
                try {
                    // Read XML file
                    const data = await readFile(filePath, 'utf-8');
                    console.log({data});
                    // console.log("json ======> ",JSON.stringify(data));
                    // console.log("JSON to parse =======>", JSON.parse(data))
                    // Parse XML
                    
                    // console.log("====================xmlObject===========>", await JSON.stringify(data));
                    
                    
                    const xmlString = data;

                    // Regular expression to match XML tags
                    const tagRegex = "TABLE OF CONTENTS";

                    // Use match to find all matches
                    const matches = xmlString.match(tagRegex);
                    console.log({matches})
                    // const parser = new xml2js.Parser({ explicitArray: true });

                    
                    // const xmlObject = await parser.parseStringPromise(data);
                    
                    // const builder = new xml2js.Builder();
                    // const mergedXML = builder.buildObject(xmlObject);
                    // console.log({ mergedXML });
                    // Find and update the desired tag
                    // if (xmlObject && xmlObject.root && xmlObject.root[tagName]) {
                    //     xmlObject.root[tagName] = newValue;

                    //     // Convert the updated object back to XML
                    //     const builder = new xml2js.Builder();
                    //     const updatedXml = builder.buildObject(xmlObject);

                    //     // Write the updated XML back to the file
                    //     console.log({updatedXml});
                    //     await writeFile(filePath, updatedXml, 'utf-8');

                    //     console.log(`Tag '${tagName}' updated successfully.`);
                    // } else {
                    //     console.error(`Tag '${tagName}' not found.`);
                    // }
                } catch (error) {
                    console.error('Error:', error);
                }
            }

            // Example usage
            const xmlFilePath = uploadedFile.path;
            const tagToUpdate = '<p>';
            const newValue = '<h1>';

            readAndUpdateXml(xmlFilePath, tagToUpdate, newValue);
            
            /* //second way
            const xmlFilePath = uploadedFile.path;
            // Read XML file content
            const xmlData: string = fs.readFileSync(xmlFilePath, 'utf-8');
            
            // Parse XML to JavaScript object
            xml2js.parseString(xmlData, { explicitArray: false, preserveChildrenOrder: true, mergeAttrs: false }, (err, result) => {
                if (err) {
                    console.error('Error parsing XML:', err);
                    return;
                }
                // Convert JavaScript object to JSON
                // const jsonData: string = JSON.stringify(result, null, 2);
                // console.log('Conversion successful. JSON file created:', jsonData);

                
                //2nd way 
                console.log("Ressult ===============> ",result);
                // console.log("Result converted ============>",JSON.stringify(result, null, 2));
                // const paragraphs = result['TaggedPDF-doc'].P;
                // console.log({ paragraphs });

                // if (paragraphs) {
                //     const chapters = [];
                //     let currentChapter: any = {};

                //     paragraphs.forEach((paragraph: any) => {
                //         const chapterId = paragraph.id;
                //         console.log({ paragraph })
                //         // If the paragraph has an 'id' attribute, consider it as a chapter tag
                //         if (chapterId) {
                //             // If there was a previous chapter, push it to the array
                //             if (Object.keys(currentChapter).length > 0) {
                //                 chapters.push(currentChapter);
                //             }

                //             // Start a new chapter
                //             currentChapter = {
                //                 id: chapterId,
                //                 content: [],
                //             };
                //         } else {
                //             // Add content to the current chapter
                //             currentChapter.content.push(paragraph._);
                //         }
                //     });

                //     // Push the last chapter to the array
                //     if (Object.keys(currentChapter).length > 0) {
                //         chapters.push(currentChapter);
                //     }

                //     console.log(" chapters[0].content ============> ",chapters[0].content );

                // }
            
            
                res.status(200).send(result);

            })
            
            */
        } catch (error) {
            next(error);
        }
    };

    public viewXml = (req: Request, res: Response, next: NextFunction) => {
        try {
            res.status(200).send("<h1>View Xml</h1>")
        } catch (error) {
            next(error);
        }
    };

}

export default PdfToXmlController;
