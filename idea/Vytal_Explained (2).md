# Vytal, Explained

## The one line version

Vytal turns a phone's camera into a vitals screening device for community health workers, explains every reading through AI in plain language, and makes sure a flagged referral never quietly disappears.

## The problem, in plain words

In a lot of rural clinics, refugee camps, and low income communities, a community health worker is often the first, and sometimes the only, person who checks on someone who's sick. The problem is these workers usually don't carry a pulse oximeter or a blood pressure cuff. So instead of a real number, a lot of triage comes down to how the person looks and how they say they feel.

Then there's a second problem, right after the first one. Say the health worker does notice something serious and tells the person to go to a real clinic. A surprising number of those people never actually make it there. Studies from rural Uganda, Zambia, and Haiti all found the same pattern: the referral gets made, someone says "go see a doctor," and then it just quietly falls apart. No phone call, no record, no one following up. By the time anyone notices, it's too late to matter.

So the real gap isn't one problem, it's two, stacked on top of each other. No easy way to get an objective reading, and no reliable way to make sure a flagged concern actually gets followed through.

## What Vytal actually does

Vytal turns the phone a health worker already carries into that missing piece.

Someone looks into the camera for about ten seconds. The app picks up on tiny color changes in the skin that happen with every single heartbeat, the exact same principle a hospital pulse oximeter uses, just without ever touching the person.

From that short scan alone, Vytal works out three things: heart rate, breathing rate, and a simple stress indicator.

If the room is too dark, or the camera just isn't good enough to get a clean signal, Vytal notices and automatically switches modes. It asks the person to place a finger over the phone's rear camera and flash instead. That version of the trick is much stronger and works even on old, cheap phones, so a bad camera or bad lighting never means "no reading," it just means a different way of getting one.

Once Vytal has a reading, it hands the numbers to Qwen, an AI language model. Qwen turns "heart rate 92, stress elevated" into a plain, calm explanation in whatever language the patient actually speaks, and gently flags if this looks like something a real doctor should see.

If a referral gets flagged, it doesn't just get said out loud and forgotten. It gets attached to that person's record right there on the spot. Vytal keeps working with zero internet connection, and quietly syncs everything to the cloud the moment a signal comes back, which matters a lot in places where connectivity comes and goes.

## Why this isn't just another heart rate app

Camera based heart rate apps already exist, Welltory and Cardiio are two well known ones. They show you a number, and that's where it ends.

On the other side, there are already excellent tools built specifically for community health workers, CommCare and the Community Health Toolkit are the big ones, used across more than 80 countries. They're genuinely great at tracking patients and referrals over time. But none of them can actually take a reading. They still assume a worker either has a separate device, or is going on gut feeling.

Vytal sits exactly in the gap between those two worlds. It's the sensor those health worker platforms don't have, and it's the follow through that pure heart rate apps never bothered to build.

## Why it actually matters

Nobody has to buy new equipment. It runs on a phone people already own.

It's built for how these clinics actually operate, offline first, explaining itself directly to the patient so there's less need for a separate translator or health educator standing there.

And importantly, it never tries to play doctor. It explains what the numbers mean, and it flags when something's worth a second look. The actual medical decision always stays with a real clinician.

## The one sentence someone can repeat to a friend

Vytal is a phone camera that reads your vitals, an AI that explains them in your own language, and a safety net that makes sure that if you're told to see a doctor, you actually don't fall through the cracks.
