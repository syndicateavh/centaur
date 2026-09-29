# India business entity governance

This site is intentionally configured as an India-first education entity.

## Canonical entity facts

- Entity: Centaur Careers
- Legal name: Centaur Careers Private Limited
- Canonical origin: `https://centaurcareers.in/`
- Country: India (`IN`)
- Published language/locale: `en-IN` / `en_IN`
- Online service area: India
- Published in-person learning venue: Mindsprout Career Hub, Alambagh, Lucknow, Uttar Pradesh 226005; address display name: Centaur Careers

The Lucknow address is a partner training location. It must not be represented as a Centaur Careers registered office, postal address, or `LocalBusiness` unless the business confirms that status separately.

## Source of truth

Business identity and location facts are maintained in `src/content/businessData.js`. Components and schema builders should consume that source instead of hard-coding name, phone, country, or address values.

The organization entity uses India and Lucknow service-area signals, contact details, social identity links, and `en-IN` language metadata. The partner location is emitted as a separate `Place` entity only on the Lucknow location page.

## External publication checklist

These actions require access to the relevant external accounts and are not automated by the application:

1. Verify the Google Business Profile for the real Lucknow training location and use the exact approved name and address.
2. Do not create profiles for Delhi-NCR, Bengaluru, Mumbai, Pune, Hyderabad, or other cities without a real staffed Centaur location.
3. Keep the public name, phone, website, and social profile URLs consistent across legitimate Indian education and business listings.
4. Add any company registration, GST, or legal postal address only after it is confirmed by the business owner; do not infer it from the partner training address.
5. Review the entity and Lucknow location in Google Search Console after deployment using the canonical URLs.

## Verification

Run the rendered-site check after a production build:

```text
npm run seo:entity:check
```

The check ensures that the organization does not absorb the partner address, India service-area and contact signals remain present, and the rendered contact/location pages use the approved entity boundary.
