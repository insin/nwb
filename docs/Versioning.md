## Versioning

Since [Semantic Versioning v2.0.0](http://semver.org/spec/v2.0.0.html) specifies...

> Major version zero (`0.y.z`) is for initial development. Anything may change at any time. The public API should not be considered stable.

...you can *technically* follow both SemVer and [Sentimental Versioning](http://sentimentalversioning.org/) at the same time.

This is what versions mean during nwb's initial development:

- `0.y` versions are major-ish, anything may change - **always read the [CHANGES](/CHANGES.md) file or [GitHub release notes](https://github.com/insin/nwb/releases) to review what's changed before upgrading**.

  *Where possible*, any changes required to the nwb config file format will be backwards-compatible in the `0.y` version they're introduced in, with a deprecation warning when the old format is used. Support for the old format will usually be dropped in the next `0.y` release or two.

- `0.y.z` versions are minor-ish, and may contain bug fixes, non-breaking changes, minor new features and non-breaking dependency changes.

  I will be pinning my own projects' nwb version range against these - e.g. `"nwb": "0.12.x"` - but **[if in doubt](https://medium.com/@kentcdodds/why-semver-ranges-are-literally-the-worst-817cdcb09277), pin your dependencies against an exact version**.

> Version 1.0.0 defines the public API. The way in which the version number is incremented after this release is dependent on this public API and how it changes.
