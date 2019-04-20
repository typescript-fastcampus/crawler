import axios, { AxiosResponse } from 'axios';
import { forkJoin, from, Observable, of } from 'rxjs/index';
import { concatAll, concatMap, map, tap } from 'rxjs/internal/operators';
import cheerio from 'cheerio';

export enum JobPlatformEndPoint {
  RocketPunch = 'https://www.rocketpunch.com',
  JobKorea = 'http://www.jobkorea.co.kr',
  Programmers = 'https://programmers.co.kr/job',
}

export interface Job {
  companyName: string;
  title: string;
  position: string;
  annualSalary: string;
  detailURI: string;
  region: string;
  shortDescription: string;
}

export class Jobs {
  private endPoint: string = 'http://localhost:3000';
  public getJobs(
    platformEndPoint: JobPlatformEndPoint = JobPlatformEndPoint.RocketPunch,
    searchKeyword: string
  ): Observable<Job> {
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

  public parseJobFromRocketPunch(keyword: string): Observable<Job> {
    return this.getPageRangeFromRocketPunch(keyword).pipe(
      concatMap((pageRange: [number, number]) => {
        const pages = [];
        for (let page = pageRange[0]; page < pageRange[1]; page++) {
          pages.push(
            axios.get(`${JobPlatformEndPoint.RocketPunch}/api/jobs/template`, {
              params: {
                page,
                keywords: keyword,
              },
            })
          );
        }
        return forkJoin(pages);
      }),
      concatAll(),
      map((response: AxiosResponse) =>
        cheerio.load(response.data.data.template)
      ),
      map(($: CheerioStatic) =>
        $('.company.item:not(.active)').find(
          '.company-jobs-detail > div > a.primary.link'
        )
      ),
      concatAll(),
      concatMap((detailItem: CheerioElement) =>
        from(
          axios.get(
            `${JobPlatformEndPoint.RocketPunch}${detailItem.attribs.href}`
          )
        )
      ),
      map((response: AxiosResponse) => cheerio.load(response.data)),
      map(($: CheerioStatic) => {
        return {
          companyName: $(
            'body > div.pusher > div.ui.vertical.center.aligned.detail.job-header.header.segment > div > div > div.job-company > div.company-name > a'
          ).text(),
          title: $('.job-title').text(),
          position: $(
            '#wrap > div.four.wide.job-infoset.column > div > div:nth-child(3) > div > div:nth-child(1) > div.content'
          )
            .text()
            .replace(/\n|\s|\r/g, ''),
          annualSalary: $(
            '#wrap > div.four.wide.job-infoset.column > div > div:nth-child(3) > div > div:nth-child(5) > div.content'
          )
            .text()
            .replace(/\n|\s|\r/g, ''),
          region: $(
            '#wrap > div.four.wide.job-infoset.column > div > div:nth-child(3) > div > div:nth-child(2) > div.content'
          )
            .text()
            .replace(/\n|\r/g, ''),
          shortDescription: $('#job-content').text(),
          detailURI: $('#job-share').attr('data-fullpath'),
        } as Job;
      })
    );
  }

  public getPageRangeFromRocketPunch(
    keyword: string
  ): Observable<[number, number]> {
    return from(
      axios.get(`${JobPlatformEndPoint.RocketPunch}/api/jobs/template`, {
        params: {
          keywords: keyword,
        },
      })
    ).pipe(
      map((res: AxiosResponse) => cheerio.load(res.data.data.template)),
      map(($: CheerioStatic) => {
        return [
          1,
          Number(
            $(
              'div.tablet.computer.large.screen.widescreen.only > a:last-child'
            ).text()
          ),
        ] as [number, number];
      })
    );
  }

  // public parseJobFromJobKorea(): Observable<Job[]> {
  //
  // }
  //
  // public parseJobFromProgrammers(): Observable<Job[]> {
  //
  // }

  public createJob(job: Job): Observable<AxiosResponse> {
    return from(axios.post(this.endPoint, job));
  }
}
