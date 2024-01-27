[Setup]
AppName=BoincTasks Js
AppVerName=BoincTasks Js by eFMer V 2.4.1
AppVersion=2.4.1
WizardStyle=modern
AppPublisher=eFMer
AppPublisherURL=https://efmer.com/
AppSupportURL=https://forum.efmer.com/
AppUpdatesURL=https://efmer.com/boinctasks-js/boinctasks-js-download/
AppComments=BoincTasks the visual BOINC interface - the best way to view your BOINC tasks
DefaultDirName={commonpf}\eFMer\BoincTasks-Js
DefaultGroupName=EFMER BoincTasks Js
UninstallDisplayIcon= {app}\boinctasksjs.exe
LicenseFile=boinctasks_licence.txt
AppCopyright=Copyright 2021-2024 eFMer
DisableDirPage=false
ShowLanguageDialog=yes
Encryption=false
PrivilegesRequired=admin

EnableDirDoesntExistWarning=false
OutputDir=out\wininstaller
Compression=lzma2/ultra64 
SolidCompression=true

; "ArchitecturesInstallIn64BitMode=x64" requests that the install be
; done in "64-bit mode" on x64, meaning it should use the native
; 64-bit Program Files directory and the 64-bit view of the registry.
; On all other architectures it will install in "32-bit mode".
ArchitecturesInstallIn64BitMode=x64 arm64

DirExistsWarning=no
InternalCompressLevel=ultra

[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
;ARM 64
Source: out\winarm\boinctasksjs-win32-arm64\*.*; DestDir: {app}; Check: InstallARM64;
Source: out\winarm\boinctasksjs-win32-arm64\locales\*.*; DestDir: {app}\locales\;
Source: out\winarm\boinctasksjs-win32-arm64\resources\*.*; DestDir: {app}\resources\ ;
;X64
Source: out\win64\boinctasksjs-win32-x64\*.*; DestDir: {app}; Check: InstallX64; Flags: solidbreak
Source: out\win64\boinctasksjs-win32-x64\locales\*.*; DestDir: {app}\locales\;
Source: out\win64\boinctasksjs-win32-x64\resources\*.*; DestDir: {app}\resources\ ;
;X86
Source: out\win32\boinctasksjs-win32-ia32\*.*; DestDir: {app}; Check: InstallOtherArch; Flags: solidbreak
Source: out\win32\boinctasksjs-win32-ia32\locales\*.*; DestDir: {app}\locales\;
Source: out\win32\boinctasksjs-win32-ia32\resources\*.*; DestDir: {app}\resources\ ;
;Common
Source: boinctasks_licence.txt; DestDir: {app};Flags: solidbreak
Source: appicons\icons\win\icon.ico; DestDir: {app};

[Icons]
Name: "{group}\BoincTasks Js"; Filename: {app}\boinctasksjs.exe;
Name: "{commondesktop}\BoincTasks Js"; Filename: "{app}\boinctasksjs.exe"; Tasks: desktopicon;
Name: "{autostartup}\BoincTasks Js"; Filename: {app}\boinctasksjs.exe;

[Run]
Filename: {app}\boinctasksjs.exe; Parameters: "/show"; Description: {cm:LaunchProgram,BoincTasks Js}; Flags: nowait postinstall skipifsilent;
Filename: https://efmer.com/boinctasks-js/boinctasks-js-download/; Description: WWW BoincTasks; Flags: shellexec nowait postinstall skipifsilent unchecked

[Code]
function InstallX64: Boolean;
begin
  Result := Is64BitInstallMode and (ProcessorArchitecture = paX64);
end;
function InstallARM64: Boolean;
begin
  Result := Is64BitInstallMode and (ProcessorArchitecture = paARM64);
end;
function InstallOtherArch: Boolean;
begin
  Result := not InstallX64 and not InstallARM64;
end;