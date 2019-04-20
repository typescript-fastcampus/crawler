import axios from 'axios';
import {from, Observable, of} from "rxjs/index";

export enum JobPlatformEndPoint {
  RocketPunch = 'https://www.rocketpunch.com',
  JobKorea = 'http://www.jobkorea.co.kr',
  Programmers = 'https://programmers.co.kr/job',
}

interface Job {
  companyName: string;
  title: string;
  position: string;
  annualSalary: string;
  detailURI: string;
  region: string;
  shortDescription: string;
}

export class Jobs {
  private endPoint: string = 'https://e88a998f.ngrok.io';
  public getJobs(
    platformEndPoint: JobPlatformEndPoint = JobPlatformEndPoint.RocketPunch,
    searchKeyword: string
  ): Observable<Job[]> {
    switch (platformEndPoint) {
      case JobPlatformEndPoint.RocketPunch:
        return this.parseJobFromRocketPunch();
      case JobPlatformEndPoint.JobKorea:
        return this.parseJobFromJobKorea();
      case JobPlatformEndPoint.Programmers:
        return this.parseJobFromProgrammers();
    }
  }

  public parseJobFromRocketPunch(): Observable<Job[]> {

  }

  public parseJobFromJobKorea(): Observable<Job[]> {

  }

  public parseJobFromProgrammers(): Observable<Job[]> {

  }

  public createJob(job: Job) {
    from(axios.post(this.endPoint))
  }
}