# Centaur Careers image system

The public site should use real, permissioned photography for learners,
mentors, classrooms, campus facilities, certificates and placement stories.
Do not use generated or unverified people imagery for testimonials or outcome
evidence.

## Asset locations

```text
public/images/
├── brand/
├── home/
├── courses/
├── placements/
├── leadership/
├── campus/
├── certificates/
└── blog/
```

Use a stable base name with width variants, for example:

```text
public/images/home/classroom-480.avif
public/images/home/classroom-768.avif
public/images/home/classroom-1280.avif
public/images/home/classroom-480.webp
public/images/home/classroom-768.webp
public/images/home/classroom-1280.webp
public/images/home/classroom.jpg
```

`ResponsiveImage` and the helpers in `src/lib/imagePresets.js` provide the
picture/source contract. Every rendered image must have:

- a meaningful `alt` value, or `alt=""` for decorative imagery;
- explicit `width` and `height` values;
- a `sizes` value matching its layout slot;
- `loading="lazy"` below the fold;
- `priority` only for the single primary hero image.

## Suggested export targets

| Use | Aspect ratio | Largest width |
| --- | ---: | ---: |
| Hero image | 4:3 or 3:2 | 1600px |
| Course/project image | 4:3 | 1280px |
| Leadership portrait | 1:1 | 768px |
| Testimonial portrait | 1:1 | 320px |
| Campus/gallery image | 3:2 | 1280px |
| Blog cover | 16:9 | 1280px |

Keep the mobile hero image under approximately 200KB where possible and avoid
loading an image that is not visible in the first viewport. Preserve the
intrinsic dimensions so image loading does not shift page content.

