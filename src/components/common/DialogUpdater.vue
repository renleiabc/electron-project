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
            'Current:' +
            downloadProcess.transferred +
            '   /   ' +
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
      tip: 'Downloading',
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

      console.log(this.isElectron);
      if (this.isElectron) {
        console.log('electron environment');
        that.ipcRenderer = window.ipcRenderer;
        console.log(that.ipcRenderer);
        this.ipcRenderer.on('message', (event, data) => {
          console.log('message', data);
        });
        this.ipcRenderer.once('update-not-available', (event, info) => {
          this.verison = info.verison;
          this.$message.success(`It's the latest version:${info.version}`);
        });
        // New version found
        that.ipcRenderer.once('autoUpdater-canUpdate', (event, info) => {
          this.newversion = info.version;
          this.$confirm(
            `New version found【v${info.version}】，Update?`,
            'Tips',
            {
              confirmButtonText: 'Confirm',
              // cancelButtonText: 'Cancel',
              type: 'warning'
            }
          )
            .then(() => {
              this.showUpdater = true;
              this.updating = true;
              that.ipcRenderer.send('autoUpdater-toDownload');
            })
            .catch(() => {
              this.ipcRenderer.send('window-close');
            });
        });
        // Download progress
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
            this.tip = 'Download completed';
          } else if (parseInt(process.percent) < 100) {
            this.updating = true;
            this.showUpdater = true;
          }
          console.log(this.updating);
        });
        // Failed to download update
        that.ipcRenderer.once('autoUpdater-error', () => {
          this.$message.error('Failed to download update!');
        });
      }
    }
    /*  start() {
     window.ipcRenderer.once('autoUpdater-downloaded', () => {
        window.ipcRenderer.send('exit-app');
      });
    } */
  }
};
</script>
