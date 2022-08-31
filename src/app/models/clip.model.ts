export default interface IClip{
    userId:string,
    displayName:string,
    title:string,
    clipFileName:string,
    id?:string,
    clipData:any,
    screenshotData:any,
    screenshotFileName:string,
    timestamp:Date
}