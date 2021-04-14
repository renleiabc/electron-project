<template>
  <el-dialog
    class="update"
    :visible.sync="showUpdater"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    width="40%"
    center
  >
    <h3 slot="title">{{ $t('updater.newversion') }}</h3>
    <div class="updater-header">
      {{ $t('updater.newversion') }}:{{ newversion }}
    </div>
    <div class="updater-body">
      <template v-if="downloadProcess.transferred">
        <p>
          {{
            '当前:' +
            downloadProcess.transferred +
            '   /   共' +
            downloadProcess.total
          }}
        </p>
        <el-progress
          :text-inside="true"
          :stroke-width="18"
          :percentage="downloadProcess.percent"
        ></el-progress>
        <p>{{ this.tip }}({{ downloadProcess.speed }})......</p>
      </template>
    </div>
    <!--  <span slot="footer" class="dialog-footer">
      <el-button type="primary" :disabled="updating" @click="start">
        {{ $t('updater.updatenow') }}
      </el-button>
    </span> -->
  </el-dialog>
</template>
<script>
export default {
  data() {
    return {
      showUpdater: false,
      downloadProcess: '',
      timer: '',
      timer2: '',
      progress: 0,
      progressText: '',
      tip: '正在下载',
      updateinfo: {},
      mustupdate: false,
      updating: false,
      newversion: '',
      ipcRenderer: null
    };
  },
  created() {},
  props: {
    isBout: {
      type: Boolean,
      default: () => false
    }
  },
  methods: {
    check() {
      let that = this;
      // 仅在Electron模式下(为了让非Electron后能够正常运行，添加的判断)
      console.log(this.isElectron);
      if (this.isElectron) {
        console.log('electron环境');
        that.ipcRenderer = window.ipcRenderer;
        console.log(that.ipcRenderer);
        this.ipcRenderer.on('message', (event, data) => {
          console.log('message', data);
        });
        this.ipcRenderer.once('update-not-available', (event, info) => {
          this.verison = info.verison;
          this.$message.success(`已经是最新版本了${info.version}`);
        });
        // 发现新版本
        that.ipcRenderer.once('autoUpdater-canUpdate', (event, info) => {
          this.newversion = info.version;
          this.$confirm(`发现有新版本【v${info.version}】，是否更新?`, '提示', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.showUpdater = true;
              this.updating = true;
              that.ipcRenderer.send('autoUpdater-toDownload');
            })
            .catch(() => {});
        });
        // 下载进度
        that.ipcRenderer.on('autoUpdater-progress', (event, process) => {
          if (process.transferred >= 1024 * 1024) {
            process.transferred =
              (process.transferred / 1024 / 1024).toFixed(2) + 'M';
          } else {
            process.transferred = (process.transferred / 1024).toFixed(2) + 'K';
          }
          if (process.total >= 1024 * 1024) {
            process.total = (process.total / 1024 / 1024).toFixed(2) + 'M';
          } else {
            process.total = (process.total / 1024).toFixed(2) + 'K';
          }
          if (process.bytesPerSecond >= 1024 * 1024) {
            process.speed =
              (process.bytesPerSecond / 1024 / 1024).toFixed(2) + 'M/s';
          } else if (process.bytesPerSecond >= 1024) {
            process.speed = (process.bytesPerSecond / 1024).toFixed(2) + 'K/s';
          } else {
            process.speed = process.bytesPerSecond + 'B/s';
          }
          process.percent = process.percent.toFixed(2);
          this.downloadProcess = process;
          console.log(process.transferred);
          console.log(process.transferred === 100);
          if (parseInt(process.percent) === 100) {
            this.updating = false;
            this.tip = '下载已完成';
          } else if (parseInt(process.percent) < 100) {
            this.updating = true;
            this.showUpdater = true;
          }
          console.log(this.updating);
        });
        // 下载更新失败
        that.ipcRenderer.once('autoUpdater-error', () => {
          this.$message.error('更新失败！');
        });
      }
    }
    /*  start() {
      // 下载完成
     window.ipcRenderer.once('autoUpdater-downloaded', () => {
        window.ipcRenderer.send('exit-app');
      });
    } */
  }
};
</script>
