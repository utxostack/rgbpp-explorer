import { Logger } from '@nestjs/common';
import cluster from 'node:cluster';
import os from 'node:os';

const numCPUs = os.cpus().length;

export class AppClusterService {
  private logger = new Logger(AppClusterService.name);

  public clusterize(callback: Function) {
    if (cluster.isPrimary) {
      this.logger.log(`Master server started on ${process.pid}`);
      for (let i = 0; i < numCPUs - 1; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker) => {
        this.logger.log(`Worker ${worker.process.pid} died. Restarting`);
        cluster.fork();
      });
      callback();
    } else {
      this.logger.log(`Cluster server started on ${process.pid}`);
      callback();
    }
  }
}
