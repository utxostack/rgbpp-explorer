import { Injectable, Logger } from '@nestjs/common';
import cluster from 'node:cluster';
import * as process from 'node:process';
import * as os from 'node:os';
import { envSchema } from './env';

const numCPUs = os.cpus().length;
const env = envSchema.parse(process.env);

@Injectable()
export class ClusterService {
  private static logger = new Logger(ClusterService.name);

  public static clusterize(callback: Function): void {
    if (cluster.isPrimary) {
      this.logger.log(`PRIMIRY PROCESS (${process.pid}) IS RUNNING `);
      const workersNum = Math.min(env.CLUSTER_WORKERS_NUM, numCPUs);
      for (let i = 0; i < workersNum; i++) {
        cluster.fork();
      }
      cluster.on('exit', (worker) => {
        this.logger.log(`WORKER ${worker.process.pid} DIED, FORKING NEW ONE`);
        cluster.fork();
      });
    } else {
      this.logger.log(`WORKER PROCESS (${process.pid}) IS RUNNING`);
      callback();
    }
  }
}
