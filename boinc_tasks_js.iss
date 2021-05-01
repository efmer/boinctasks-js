[Setup]
AppName=BoincTasks Js
AppVerName=BoincTasks Js by eFMer V 1.15
AppVersion=1.15
AppPublisher=eFMer
AppPublisherURL=https://efmer.com/
AppSupportURL=https://forum.efmer.com/
AppUpdatesURL=https://efmer.com/download-boinctasks/
AppComments=BoincTasks the visual BOINC interface - the best way to view your BOINC tasks
DefaultDirName={commonpf}\eFMer\BoincTasks-Js
DefaultGroupName=EFMER BoincTasks Js
UninstallDisplayIcon= {app}\boinctasksjs.exe
LicenseFile=boinctasks_licence.txt
AppCopyright=Copyright 2021 eFMer
DisableDirPage=false
ShowLanguageDialog=yes
Encryption=false
PrivilegesRequired=admin

EnableDirDoesntExistWarning=false
OutputDir=out\wininstaller
Compression=lzma/ultra
SolidCompression=true

; "ArchitecturesInstallIn64BitMode=x64" requests that the install be
; done in "64-bit mode" on x64, meaning it should use the native
; 64-bit Program Files directory and the 64-bit view of the registry.
; On all other architectures it will install in "32-bit mode".
ArchitecturesInstallIn64BitMode=x64
; Note: We don't set ProcessorsAllowed because we want this
; installation to run on all architectures (including Itanium,
; since it's capable of running 32-bit code too).
DirExistsWarning=no
InternalCompressLevel=ultra

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
Source: out\win64\boinctasksjs-win32-x64\*.*; DestDir: {app};
Source: out\win64\boinctasksjs-win32-x64\locales\*.*; DestDir: {app}\locales\;
Source: out\win64\boinctasksjs-win32-x64\resources\*.*; DestDir: {app}\resources\ ;
Source: out\win64\boinctasksjs-win32-x64\swiftshader\*.*; DestDir: {app}\swiftshader\;
Source: boinctasks_licence.txt; DestDir: {app};
Source: appicons\icons\win\icon.ico; DestDir: {app};

[Icons]
Name: "{group}\BoincTasks Js"; Filename: {app}\boinctasksjs.exe;
Name: "{commondesktop}\BoincTasks Js"; Filename: "{app}\boinctasksjs.exe"; Tasks: desktopicon;
Name: "{autostartup}\BoincTasks Js"; Filename: {app}\boinctasksjs.exe;

[Run]
Filename: {app}\boinctasksjs.exe; Parameters: "/show"; Description: {cm:LaunchProgram,BoincTasks Js}; Flags: nowait postinstall skipifsilent;
Filename: https://efmer.com/boinctasks-js/boinctasks-js-download/; Description: WWW BoincTasks; Flags: shellexec nowait postinstall skipifsilent unchecked