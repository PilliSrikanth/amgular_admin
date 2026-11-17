import { Component, OnInit } from '@angular/core';
import { HostelService } from '../hostel.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css']
})
export class UsersComponent implements OnInit {

  hostel: any;
  hostelId: string = '';
  ownerId: string = localStorage.getItem('ownerId') || '';
  hostelUsers: any[] = [];
  dateWiseUsers: any[] = [];

  constructor(private hostelService: HostelService) {}

  ngOnInit() {
    this.hostelId = localStorage.getItem('hostelId') || '';
    if(this.hostelId) {
      this.loadHostelUsers(this.hostelId);
    }
  }

  loadHostelUsers(hostelId: string) {
    this.hostelService.getHostelById(hostelId).subscribe({
      next: (res: any) => {
        this.hostel = res.data || res;
        this.hostelUsers = this.hostel.hostelUsers || [];
        this.groupUsersByDate(this.hostelUsers);
      },
      error: (err) => console.error(err)
    });
  }

  groupUsersByDate(users: any[]) {
    const grouped: any = {};
    users.forEach(u => {
      const date = new Date(u.createdAt || Date.now()).toLocaleDateString();
      if (!grouped[date]) grouped[date] = [];
      grouped[date].push({
        _id: u._id,
        name: u.name,
        email: u.email,
        time: new Date(u.createdAt || Date.now()).toLocaleTimeString(),
        active: true
      });
    });

    this.dateWiseUsers = Object.keys(grouped).map(date => ({
      date,
      users: grouped[date]
    }));
  }

  deleteUser(id: string) {
    console.log("Delete user:", id);
  }


  
searchText = '';

onDeleteClick(event: MouseEvent, userId: string): void {
  // Prevent clicking Delete from opening the chat.
  event.stopPropagation();
  event.preventDefault();

  this.deleteUser(userId);
}

}
