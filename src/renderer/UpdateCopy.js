/*
 * @Author: abc
 * @Date: 2020-10-30 10:40:12
 * @LastEditors: abc
 * @LastEditTime: 2021-04-13 18:21:50
 * @Description:
 */
const { autoUpdater } = require('electron-updater');
import { ipcMain } from 'electron';
let mainWindow = null;
export function updateHandle(win, url) {
  console.log('函数运行');
  mainWindow = win;
  autoUpdater.autoDownload = false; // 关闭自动更新
  autoUpdater.autoInstallOnAppQuit = true; // APP退出的时候自动安装
  //设置更新包的地址
  autoUpdater.setFeedURL(url);
  setTimeout(() => {
    // 检测是否有更新
    autoUpdater.checkForUpdates();
  }, 1500);
  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('message', 'Checking for update...');
  });

  autoUpdater.on('update-available', (info) => {
    // 可以更新版本
    sendStatusToWindow('autoUpdater-canUpdate', info);
  });
  //监听没有可用更新事件
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('update-not-available', info);
  });
  autoUpdater.on('error', (err) => {
    // 更新错误
    sendStatusToWindow('autoUpdater-error', err);
  });
  // 发起更新程序
  ipcMain.on('autoUpdater-toDownload', () => {
    autoUpdater.downloadUpdate();
  });
  autoUpdater.on('download-progress', (progressObj) => {
    // 正在下载的下载进度
    sendStatusToWindow('autoUpdater-progress', progressObj);
  });
  autoUpdater.on('update-downloaded', () => {
    // 下载完成
    sendStatusToWindow('autoUpdater-downloaded');
    // 退出程序
    autoUpdater.quitAndInstall();
  });
}

// 发送消息给渲染线程
function sendStatusToWindow(status, params) {
  mainWindow.webContents.send(status, params);
}
