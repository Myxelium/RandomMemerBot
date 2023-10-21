import { AddUserToAvoidList } from './addUserToAvoidList';
import { DeleteSoundFile } from './deleteSoundFile';
import { GetSoundFiles } from './getSoundFiles';
import { UploadYouTubeFile } from './uploadYouTubeFile';
import { DeleteUserFromAvoidList } from './deleteUserFromAvoidList';
import { JoinChannel } from './joinChannel';

export class Handlers {
    public static AddUserToAvoidList = AddUserToAvoidList;
    public static DeleteSoundFile = DeleteSoundFile;
    public static GetSoundFiles = GetSoundFiles;
    public static UploadYouTubeFile = UploadYouTubeFile;
    public static DeleteUserFromAvoidList = DeleteUserFromAvoidList;
    public static JoinChannel = JoinChannel;
}