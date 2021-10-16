import { observable, action, makeObservable, runInAction, computed, toJS, onBecomeObserved } from 'mobx';
import { TrainingTask } from './models/task';

import authService from './components/api-authorization/AuthorizeService';
import { User } from 'oidc-client';
import { Trainee } from './models/trainee';
import moment, { Moment } from 'moment';
import { TrainingRecord } from './models/trainingRecord';
import { TaskProgress } from './models/taskProgress';
import { Completed } from './models/completed';
import { Schedule } from './models/schedule';

export class TrainingStore {
  @observable tokenExpired: boolean = false;

  @observable schedule :Schedule = {};
  @observable taskList :TrainingTask[];
  @observable user?: User;

  @observable viewTrainee?: Trainee;
  @observable progress: { [taskTitle: string]: any; } = {};

  constructor() {
    makeObservable(this);

    authService.listenUser((user: User) => runInAction(() => {
      this.user = user;
      this.tokenExpired = false;
    }))

    this.taskList = [
      { 'title': 'Contact Information', summary: 'Address, Email, Phone Number', category: 'personal' },
      { 'title': 'Emergency Contacts', summary: 'Who to call in an emergency', category: 'personal' },
      { 'title': 'First Aid', summary: 'American Heart (AHA), Red Cross (ARC) or equivalent First Aid card', category: 'paperwork', details: 'Submit a scan or picture of a current first aid card to training.admin@kcesar.org' },
      { 'title': 'CPR', summary: 'American Heart (AHA), Red Cross (ARC) or equivalent CPR card', category: 'paperwork', details: 'Submit a scan or picture of a current CPR card to training.admin@kcesar.org' },
      { 'title': 'ICS-100', summary: 'FEMA required online course', category: 'online', details: 'ICS 100, Introduction to the Incident Command System, introduces the Incident Command System (ICS) and provides the foundation for higher level ICS training. This course describes the history, features and principles, and organizational structure of the Incident Command System. It also explains the relationship between ICS and the National Incident Management System (NIMS).\n\nhttps://training.fema.gov/is/courseoverview.aspx?code=IS-100.b' },
      { 'title': 'ICS-700', summary: 'FEMA required online course', category: 'online', details: 'This course introduces and overviews the National Incident Management System (NIMS). NIMS provides a consistent nationwide template to enable all government, private-sector, and nongovernmental organizations to work together during domestic incidents.\n\nhttps://training.fema.gov/is/courseoverview.aspx?code=IS-700.a', },
      //{ 'title': 'Course A', summary: 'Evening orientation', category: 'session', details: 'This is an in-town weeknight informational meeting used to present ESAR objectives, organization and procedures.\n\nDiscussions center on basic training course content, requirements for team member field qualification, and personal equipment needs.', hours: 2},
      { 'title': 'Course B', summary: 'Indoor navigation course', category: 'session', hours: 9 },
      { 'title': 'Course C', summary: "Outdoor weekend - Intro to SAR", category: 'session', hours: 32.5, prereqs: ['Course B', /*'ESAR F/A - Basic' /*, 'Background Check', 'LFL Registration'*/] },
      { 'title': 'ESAR Basic - Intro to Searcher First Aid', summary: '', category: 'session', hours: 9, prereqs: ['Course B']},
      { 'title': 'Background Check', summary: "Sheriff's Office application", category: 'paperwork', details: 'All potential KCESAR members submit an application to the King County Sheriff\'s office, who will conduct a criminal background check on the applicant.\n\nThis status will be updated when we are informed that you have passed this check. KCESAR does not receive the result of the background check except a pass/fail from the sheriff\'s office.' },
      { 'title': 'LFL Registration', summary: "For youth members", category: 'paperwork' },
//      { 'title': 'Submit Photo', summary: "Submit portrait for ID card", category: 'paperwork' },
      { 'title': 'Course I', summary: "Outdoor weekend - Navigation", category: 'session', prereqs: ['Course C'], hours: 31 },
      { 'title': 'Course II', summary: "Outdoor weekend - Evaluation", category: 'session', prereqs: ['Course I'], hours: 31 },
      { 'title': 'ESAR Basic - Searcher First Aid', summary: 'SAR specific first aid and scenarios', category: 'session', hours: 9, prereqs: ['Course II', 'ESAR Basic - Intro to Searcher First Aid']},
      { 'title': 'Course III', summary: "Outdoor weekend - mock mission", category: 'session', prereqs: ['ESAR Basic - Searcher First Aid', 'ICS-100', 'ICS-700'], hours: 31 },
      { 'title': 'ESAR Ops Orientation', summary: 'Information for new graduates about responding to missions, etc.', category: 'session', prereqs: ['Course III'], hours: 3 }
    ];
  }

  @action.bound
  async loadTrainee(traineeId?: string) {
    try {
      if (!traineeId) traineeId = this.user?.profile.sub;

      var t :Trainee|undefined = await this.apiGet<Trainee|undefined>(`/api/trainees/${traineeId}`);
      if (!t?.id) t = undefined;

      runInAction(() => {
        this.viewTrainee = t;
        this.progress = {};
        this.schedule = {};
      });

      if (!t) return;
      
  console.log(this.viewTrainee)

      const c = (await this.apiGet<{items: TrainingRecord[]}>(`/api/trainees/${traineeId}/completed`)).items
                  .reduce((accum, cur) => ({...accum, [cur.course.name]: cur}), {} as Completed);
      let progress :{[taskTitle: string]: TaskProgress }= {};

      for (let i=0; i<this.taskList.length; i++) {
        const task = this.taskList[i];
        const title = task.title;
  
        const p = this.computers[task.category](task, c);
        const blocking = []
        for (let i=0; i < (task.prereqs || []).length; i++) {
          const name = task.prereqs![i]
          var otherProgress = progress[name]
          if (otherProgress.status !== 'Complete') blocking.push(name)
        }

        progress[title] = {
          ...p,
          available: task.category !== 'personal' && !p.completed && !blocking.length,
          blocked: task.category === 'personal' ? undefined : blocking.length ? blocking : undefined,
        };
      }

      runInAction(() => this.progress = progress);

      window.setTimeout(async () => {
        const response = await this.apiGet<any>(`/api/schedule/${traineeId}`);
        runInAction(() => this.schedule = response.items);
      }, 0);


    } catch (err :any) {
      if (err.expiredToken) {
        runInAction(() => this.tokenExpired = true);
      }
    }
  }
  
  private async apiGet<T>(url: string) {
    return await fetch(url, {
      headers: { Authorization: `Bearer ${await authService.getAccessToken()}`}
    })
    .then(async response => {
      if (!response.ok) {
        if (response.status == 401) {
          throw { expiredToken: true, message: "Your session is expired." }
        }
        throw { message: 'Bad response' };
      }
      return (await response.json()) as T;
    });
  }

  computers :{[type:string]: (task:TrainingTask, completed:Completed) => { status?: string, completed?: Moment|boolean}} = {
    online: function(task, completed) {
      const record = completed[task.title] || {}
      return {
        status: record.completed ? 'Complete' : undefined, completed: record.completed ? moment(record.completed as string) : undefined
      };
    },
    session: function(task, completed) {
      const record = completed[task.title] || {}
      return {
        status: record.completed ? 'Complete' : undefined,
        completed: record.completed ? moment(record.completed as string) : undefined
      };
    },
    paperwork: function(task, completed) {
      switch (task.title) {
        case 'Background Check':
          return { status: 'Complete', complete: true};
          //return { status: state.member.backgroundKnown ? 'Complete' : undefined, completed: !!state.member.backgroundKnown }
        
          default:
            const record = completed[task.title]
            if (record) {
              return {
                status: record.completed ? 'Complete' : undefined,
                complete: record.completed ? moment(record.completed as string) : undefined
              };
            }
            return { status: undefined };
      }
    },
    personal: function(task, state) {
      return { status: undefined };
    }
  }
}