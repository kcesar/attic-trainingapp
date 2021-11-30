import { observable, makeObservable, computed, action, runInAction } from 'mobx';
import { cursorTo } from 'readline';
import { AdminRoster } from './models/adminRoster';

import { TrainingStore } from './store';

interface SessionRow {
  id:number,when:string,current:number,capacity:number,waiting:number
}

export class AdminStore {
  private coreStore = new TrainingStore();

  @observable schedule?: { [title:string]: SessionRow[] }

  @observable selectedCourse?:string;
  @observable roster?: {
    course: { title: string },
    session: SessionRow,
    trainees: any[],
  };

  constructor(coreStore: TrainingStore) {
    makeObservable(this);
    this.coreStore = coreStore;
  }

  @computed
  get courseList() {
    return this.coreStore.taskList.filter(t => t.category === 'session');
  }

  @computed
  get user() { return this.coreStore.user; }

  @action.bound
  async selectCourse(title?: string) {
    const course = this.courseList.filter(c => c.title === title)[0];
    this.selectedCourse = course?.title;
    if (course && !course.adminSchedule) {
      await this.loadSchedule();
    }
  }

  @action.bound
  async loadRoster(id: number) {
    await this.loadSchedule();

    const list: {[id:number]: { title: string, session:SessionRow }} = Object.keys(this.schedule!).flatMap(
                  title => this.schedule![title].map(s => ({ id: s.id, title: title, session: s}))
                 ).reduce((accum, cur) => Object.assign(accum, { [cur.id]: cur }), {});

                 const response = await this.coreStore.apiGet<AdminRoster[]>(`/api/sessions/${id}/roster`);
    runInAction(() => {
      this.selectedCourse = list[id].title;
      this.roster = {
                      course: { title: list[id].title },
                      session: list[id].session,
                      trainees: response
                    };
    });
  }

  private async loadSchedule() {
    if (this.schedule) return this.schedule;
    const response = await this.coreStore.apiGet<{
      items: { [title:string]: {id:number,when:string,current:number,capacity:number,waiting:number}[]}
    }>(`/api/schedule`);
    runInAction(() => {
      this.schedule = response.items;
      Object.entries(response.items).forEach(([key, value]) => {
        const iCourse = this.courseList.find(c => c.title === key);
        if (!iCourse) return;
        iCourse.adminSchedule = value;
      })
    });
    return this.schedule;
  }
}