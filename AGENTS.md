# AGENTS.md - Sengi Development Guide

Sengi is a multi-account Mastodon/Pleroma desktop client built with Angular 7, TypeScript 3.2, and NGXS state management.

## Commands

```bash
# Development
npm start                 # Start dev server (ng serve)
npm run start-mem        # Start with increased memory (4GB)

# Build
npm run build            # Production build (ng build --prod)
npm run dist             # Alias for build

# Testing
npm test                 # Run tests in watch mode (Karma + Jasmine)
npm run test-nowatch     # Run tests once without watch
npm run e2e             # Run end-to-end tests (Protractor)

# Linting
npm run lint            # Run TSLint on all TypeScript files
```

### Running Single Tests

```bash
# Filter tests by pattern
npm test -- --include='**/mastodon.service.spec.ts'

# Run specific test file
npm test -- --include='**/services/tools.service.spec.ts'
```

## Code Style

### TypeScript/Angular Standards

- **Indentation**: 2 spaces (no tabs)
- **Quotes**: Single quotes for strings
- **Line length**: Maximum 140 characters
- **Semicolons**: Required at end of statements
- **Equality**: Use `===` and `!==` (triple equals), allow `== null` checks
- **Variable declarations**: Prefer `const`, never use `var`

### Naming Conventions

- **Components**: PascalCase with `Component` suffix (e.g., `UserProfileComponent`)
- **Services**: PascalCase with `Service` suffix (e.g., `MastodonService`)
- **Files**: kebab-case (e.g., `mastodon.service.ts`, `user-profile.component.ts`)
- **Interfaces**: PascalCase (e.g., `AccountInfo`, `StreamElement`)
- **Enums**: PascalCase with `Enum` suffix (e.g., `StreamTypeEnum`, `VisibilityEnum`)
- **Private members**: Use `readonly` for dependencies, may use underscore prefix sparingly
- **CSS selectors**: Components use `app-` prefix, kebab-case (e.g., `<app-user-profile>`)

### Imports

Order imports in this sequence:
1. Angular core modules
2. Third-party libraries (rxjs, @ngxs, @fortawesome)
3. Internal modules (absolute paths from `src/app`)

```typescript
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Store } from '@ngxs/store';

import { AccountInfo } from '../states/accounts.state';
import { MastodonService } from './mastodon.service';
```

### Component Structure

- Must implement lifecycle interfaces (`OnInit`, `OnDestroy`)
- Use `@Select()` decorator for NGXS state selections
- Mark injected services as `private readonly`
- Component selectors: element type, `app` prefix, kebab-case

```typescript
@Component({
  selector: 'app-component-name',
  templateUrl: './component-name.component.html',
  styleUrls: ['./component-name.component.scss']
})
export class ComponentNameComponent implements OnInit, OnDestroy {
  @Select(state => state.statemodel.property) property$: Observable<Type>;

  constructor(private readonly service: SomeService) { }

  ngOnInit(): void { }
  ngOnDestroy(): void { }
}
```

### Service Structure

- Mark as `@Injectable()` or `@Injectable({ providedIn: 'root' })`
- Use constructor injection with `private readonly`
- Return Promises for async operations
- Handle errors with `.catch()` and propagate to notification service

```typescript
@Injectable({ providedIn: 'root' })
export class MyService {
  constructor(private readonly httpClient: HttpClient) { }

  fetchData(): Promise<Data> {
    return this.httpClient.get<Data>(url).toPromise()
      .catch(err => { /* handle */ });
  }
}
```

### State Management (NGXS)

- Define actions as classes with `static readonly type`
- Use `State<Model>` decorator for state classes
- Implement actions with `@Action` decorator
- Use `patchState()` for immutable updates

```typescript
export class MyAction {
  static readonly type = '[State] Action description';
  constructor(public payload: Type) { }
}

@State<StateModel>({
  name: 'statename',
  defaults: { /* defaults */ }
})
export class MyState {
  @Action(MyAction)
  myAction(ctx: StateContext<StateModel>, action: MyAction) {
    ctx.patchState({ /* updates */ });
  }
}
```

### Error Handling

- Use `HttpErrorResponse` for HTTP errors
- Use `NotificationService.notifyHttpError()` for user-facing errors
- Use `NotificationService.notify()` for custom messages
- Prefer Promise-based error handling over try/catch in most cases

### Testing

- Test files: `*.spec.ts` alongside source files
- Use `TestBed.configureTestingModule()` for unit tests
- Skip incomplete tests with `xdescribe()` instead of deleting
- Structure: describe -> beforeEach -> it blocks

## Project Structure

```
src/app/
  components/          # UI components
    stream/           # Stream-related components
    floating-column/  # Floating panel components
    create-status/    # Status creation components
    common/           # Shared components
  services/           # Business logic and API calls
    models/           # Service interfaces
  states/             # NGXS state management
  models/             # Application models
  pipes/              # Custom pipes
  tools/              # Utility functions
  themes/             # Theme implementations
sass/                 # Global SCSS styles
```

## Key Technologies

- **Angular 7** - Framework
- **TypeScript 3.2** - Language
- **NGXS** - State management
- **RxJS 6** - Reactive programming
- **Bootstrap 4** - CSS framework
- **FontAwesome 5** - Icons
- **Karma + Jasmine** - Testing

## License

AGPL-3.0-or-later
