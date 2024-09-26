import { Injectable, Logger } from '@nestjs/common';
import cluster from 'node:cluster';
import * as process from 'node:process';
import * as os from 'node:os';

const numCPUs = os.cpus().length;

@Injectable()
export class ClusterService {
  private static logger = new Logger(ClusterService.name);

  public static clusterize(callback: Function): void {
    if (cluster.isPrimary) {
      this.logger.log(`PRIMIRY PROCESS (${process.pid}) IS RUNNING `);
      for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker) => {
        this.logger.log(`WORKER ${worker.process.pid} DIED, FORKING NEW ONE`);
        cluster.fork();
      });
    } else {
      callback();
    }
  }
}
