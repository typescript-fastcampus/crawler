import axios, {AxiosResponse} from 'axios';
import {forkJoin, from, Observable, of} from 'rxjs/index';
import {concatAll, concatMap, map, tap} from "rxjs/internal/operators";
import cheerio from 'cheerio';

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
  ): Observable<any> {
    switch (platformEndPoint) {
      case JobPlatformEndPoint.RocketPunch:
        return this.parseJobFromRocketPunch(searchKeyword);
      // case JobPlatformEndPoint.JobKorea:
      //   return this.parseJobFromJobKorea();
      // case JobPlatformEndPoint.Programmers:
      //   return this.parseJobFromProgrammers();
      default:
        return this.parseJobFromRocketPunch(searchKeyword);
    }
  }

  public parseJobFromRocketPunch(keyword: string): Observable<any> {
    return this.getPageRangeFromRocketPunch(keyword).pipe(
      concatMap((pageRange: [number, number]) => {
        const pages = [];
        for (let page = pageRange[0]; page < pageRange[1]; page++) {
          pages.push(axios.get(`${JobPlatformEndPoint.RocketPunch}/api/jobs/template`, {
            params: {
              page,
              keywords: keyword
            }
          }))
        }
        return forkJoin(pages);
      }),
      concatAll(),
      map((response: AxiosResponse) => cheerio.load(response.data.data.template)),
      map(($: CheerioStatic) => $('.company.item:not(.active)').find('.company-jobs-detail > div > a.primary.link')),
      concatAll(),
      concatMap((detailItem: CheerioElement) => from(axios.get(`${JobPlatformEndPoint.RocketPunch}${detailItem.attribs.href}`))),
      map((response: AxiosResponse) => cheerio.load(response.data)),
      map(() => {

      })
    )
  }

  public getPageRangeFromRocketPunch(keyword: string): Observable<[number, number]> {
    return from(axios.get(`${JobPlatformEndPoint.RocketPunch}/api/jobs/template`, {
      params: {
        keywords: keyword
      }
    })).pipe(
      map((res: AxiosResponse) => cheerio.load(res.data.data.template)),
      map(($: CheerioStatic) => {
        return [
          1,
          Number($('div.tablet.computer.large.screen.widescreen.only > a:last-child').text())
        ] as [number, number]
      })
    )
  }


  // public parseJobFromJobKorea(): Observable<Job[]> {
  //
  // }
  //
  // public parseJobFromProgrammers(): Observable<Job[]> {
  //
  // }

  public createJob(job: Job) {
    from(axios.post(this.endPoint))
  }
}