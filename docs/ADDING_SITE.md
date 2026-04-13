# Adding A Site Adapter

This project treats each company recruitment site as a standalone adapter under `src/sites/<site>/`.

The standalone `hire` CLI is the primary runtime. OpenCLI wrappers are optional compatibility code and should not be required by the core adapter.

## Adapter Shape

Create the site implementation:

```text
src/sites/<site>/
├── index.js
└── utils.js
```

The public adapter in `index.js` should export this shape:

```js
export default {
  id: 'example',
  name: 'Example',
  description: 'Example social recruitment',
  columns: [],
  detailColumns: [],
  maxPageSize: 20,
  async filters() {},
  async search(args) {},
  async detail(id) {},
  async all(args) {},
};
```

Then register it in `src/core/registry.js`.

Optional OpenCLI command wrappers can live beside the adapter or under `integrations/opencli/`, but they must be thin wrappers over the standalone adapter or shared utilities.

## Command Contract

Every site must support the same user-facing commands:

- `search`: fast keyword and filter search.
- `detail`: fetch one job by stable source id.
- `all`: paginate all matching jobs, with `--max 0` meaning no client-side cap.
- `filters`: expose city, category, nature, and other useful filter codes.

## Output Contract

Normalize source fields into these names when available:

- `id`, `job_no`, `name`, `url`
- `category_code`, `category_name`
- `nature_code`, `nature_name`
- `location_codes`, `location_names`
- `experience_code`, `levels`
- `department_code`, `department_name`, `updated_at`
- `description`, `requirement`
- `raw`

Keep `raw` compact. It should help debug source changes without making table output noisy.

## API Research Checklist

1. Open the recruitment page and inspect network requests.
2. Identify list, detail, and filter endpoints.
3. Check whether requests need cookies, signatures, CSRF tokens, or browser headers.
4. Confirm page size limits and pagination behavior.
5. Verify empty results and invalid ids produce clear errors.
6. Add a smoke script under `scripts/`.

## Quality Bar

Before calling an adapter done, verify:

```bash
hire <site> filters --format json
hire <site> search AI --limit 5 --format json
hire <site> detail <known-id> --format json
hire <site> all --max 20 --format json
```

Search and all should return agent-ready details whenever the source list endpoint omits `description` or `requirement`.
