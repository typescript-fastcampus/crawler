import cron from 'node-cron';
import { Job, JobPlatformEndPoint, Jobs } from './jobs';
import { forkJoin } from 'rxjs/index';
import { catchError, concatMap } from 'rxjs/internal/operators';
import { AxiosResponse } from 'axios';

const searchKeyword: string = 'typescript';
const jobs$ = new Jobs().getJobs(
  JobPlatformEndPoint.RocketPunch,
  searchKeyword
);

jobs$
  .pipe(concatMap((job: Job) => new Jobs().createJob(job)))
  .subscribe((response: AxiosResponse) => {
    console.log('Res', response.statusText);
  });

cron.schedule('* * * * *', () => {
  // const searchKeyword: string = 'typescript';
  // const jobs$ = (new Jobs()).getJobs(JobPlatformEndPoint.RocketPunch, searchKeyword);
  //
  // jobs$.subscribe((job) => {
  //   console.log('job', job);
  // })
});
