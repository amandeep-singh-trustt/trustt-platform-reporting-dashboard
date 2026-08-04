import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Icon } from '../../components/icon/icon';
import { SearchService } from '../../services/search.service';
import { ThemeService } from '../../services/theme.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [FormsModule, Icon],
  templateUrl: './navbar.html',
})
export class Navbar {
  readonly search = inject(SearchService);
  readonly theme = inject(ThemeService);
}
