/*
    BoincTasks Js to show and control one or multiple BOINC clients.
    Copyright (C) 2021-now  eFMer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const Functions = require('../functions/functions');
const functions = new Functions();
const Logging = require('../functions/logging');
const logging = new Logging();
const btC = require('../functions/btconstants');
const WindowsState = require('../functions/window_state');
const windowsState = new WindowsState();
const ReadWrite  = require('../functions/readwrite');
const readWrite = new ReadWrite();

const {BrowserWindow} = require('electron');

let gChildSettingsEmail = null;
let gCssDarkEmail = null;

// https://nodemailer.com/smtp/

class SendEmail
{
  email(gb,type,item)
  {
    try {
        switch(type)
        {
            case "menu":
                editEmail(gb);
            break;
            case "apply":
                apply(gb,item)
            break;
            case "test":
                readxml(gb);
                testEmail(gb,item);
            break;
        }
    } catch (error) {
      logging.logError('SendEmail,edit', error);     
    }
  }

  readXml(gb)
  {
    readxml(gb);
  }

  send(rules, eSubject, eBody)
  {
    sendEmail(rules, eSubject, eBody) 
  }

  setTheme(css)
  {
      insertCssDark(css);
  }
}
module.exports = SendEmail;

function readxml(gb)
{
    try {
      gb.rules.email.data = null;
      let emailXml = readWrite.read("settings\\email", "email_data.xml");
      if (emailXml !== null)
      {
          logging.logDebug("File: email_data.xml found")
          parseEmail(gb,emailXml);
      }          
    } catch (error) {
      logging.logError('SendEmail,read', error);           
    }
}

function editEmail(gb)
{
  try {
      let title = "Email";
      if (gChildSettingsEmail === null)
      {
        let state = windowsState.get("settings_email",700,800)
    
        gChildSettingsEmail = new BrowserWindow({
          'x' : state.x,
          'y' : state.y,
          'width': state.width,
          'height': state.height,
          webPreferences: {
            sandbox : false,
            contextIsolation: false,  
            nodeIntegration: true,
            nodeIntegrationInWorker: true,        
            //:'${__dirname}/preload/preload.js',
          }
        });
        gChildSettingsEmail.loadFile('index/index_email.html')
        gChildSettingsEmail.once('ready-to-show', () => {    
            if (btC.DEBUG_WINDOW)
            {
                gChildSettingsEmail.webContents.openDevTools()
            }  
            gChildSettingsEmail.show();  
            gChildSettingsEmail.setTitle(title);
            set(gb);
        })
        gChildSettingsEmail.webContents.on('did-finish-load', () => {
            insertCssDark(gb.theme);
          })         
        gChildSettingsEmail.on('close', () => {
          let bounds = gChildSettingsEmail.getBounds();
          windowsState.set("settings_email",bounds.x,bounds.y, bounds.width, bounds.height)
        })     
        gChildSettingsEmail.on('closed', () => {
            gChildSettingsEmail = null
        })    
      }
      else
      {
        if (btC.DEBUG_WINDOW)
        {
            gChildSettingsEmail.webContents.openDevTools()
        }          
        gChildSettingsEmail.setTitle(title); 
        gChildSettingsEmail.hide();
        gChildSettingsEmail.show();
        set(gb);
        
      }            
  } catch (error) {
      logging.logError('SendEmail,editEmail', error);        
  }  
}

async function insertCssDark(darkCss)
{
  try {
    if (gCssDarkEmail !== null)
    {
        gChildSettingsEmail.webContents.removeInsertedCSS(gCssDarkEmail) 
    }    
    gCssDarkEmail = await gChildSettingsEmail.webContents.insertCSS(darkCss);  
  } catch (error) {
    gCssDarkEmail = null;
  }
}

function set(gb)
{
    let item = gb.rules.email;
    gChildSettingsEmail.webContents.send('set',item); 
}

function apply(gb,item)
{
    try {
        item.msg = "";
        item.extra = "";
        readWrite.write("settings\\email","email.json",JSON.stringify(item));
        gb.rules.email = item;
        gChildSettingsEmail.hide();
    } catch (error) {
        logging.logError('SendEmail,apply', error);       
    }

}

function testEmail(gb,item)
{
    try {
        let subject = 'BoincTasks Js Test';
        let body = 'This is a test message from BoincTasks Js!'
        gb.rules.email = item;        
        sendEmail(gb.rules,subject,body);
    } catch (error) {
        logging.logError('SendEmail,testEmail', error);         
    }

}

function sendEmail(rules, eSubject, eBody)
{
    let nodemailer = require('nodemailer');
    let transporter = null;
    try {
        let email = rules.email.email;
        let passWord = rules.email.passWord;
        let send = rules.email.send;

        let data = rules.email.data;
        if (data == undefined)
        {
            data = null;
        }
        if (data === null)
        {
            transporter = nodemailer.createTransport({
                service: 'gmail',
                auth: {
                       user: email,
                       pass: passWord
                }
            });
        }
        else
        {
            transporter = nodemailer.createTransport({
                host: data.host,
                port: data.port,
                secure: data.secure,
                auth: {
                  user: email,
                  pass: passWord
                },
                tls: {
                  // do not fail on invalid certs
                  rejectUnauthorized: data.tls
                }
              });
        }
    
        var mailOptions = {
            from: email,
            to: send,
            subject: eSubject,
            text: eBody
        };
    
        transporter.sendMail(mailOptions, function(error, info)
        {
            if (error)
            {
                if (gChildSettingsEmail !== null) gChildSettingsEmail.webContents.send('status',error.message); 
                logging.logDebug("Test email: " + error.message);
            } else
            {
                if (gChildSettingsEmail !== null) gChildSettingsEmail.webContents.send('status','Email send, check your mailbox'); 
            }  
        }); 
    } catch (error) {
        logging.logError('SendEmail,sendEmail', error);
    }
}

function parseEmail(gb,xml)
{
    try {
        var parseString = require('xml2js').parseString;
        parseString(xml, function (err, data) {
        if (functions.isDefined(data))
        {
            emaildata = data['email'];
            if (functions.isDefined(emaildata))
            {
                let missing = "email_data.xml missing: ";
                if (!functions.isDefined(emaildata.host))
                {
                    logging.logDebug(missing + "host");
                    return;
                }
                if (!functions.isDefined(emaildata.port))
                {
                    logging.logDebug(missing + "port");
                    return;
                }
                if (!functions.isDefined(emaildata.secure))
                {
                    logging.logDebug(missing + "secure");
                    return;
                }
                if (!functions.isDefined(emaildata.tls))
                {
                    logging.logDebug(missing + "tls");
                    return;
                }
                let item = Object();
                item.host = emaildata.host[0];
                item.port = emaildata.port[0];
                item.secure = emaildata.secure[0];
                item.tls = emaildata.tls[0];
                gb.rules.email.data = item;
                var ii =1;
            }
            else
            {
                logging.logDebug(missing + "main email tag");
            }
        }
        else
        {
            logging.logDebug(" email_data.xml: " + err.message);
        }        
    });
    } catch (error) {
        logging.logError('SendEmail,parseEmail', error);
    }
}