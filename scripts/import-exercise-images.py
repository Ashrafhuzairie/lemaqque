"""Rebuild the bundled reference gallery from a local free-exercise-db checkout and supplied chest PDF.
Usage: python scripts/import-exercise-images.py DB_DIRECTORY CHEST_PDF
Requires PyMuPDF and Pillow. Sources are never fetched at application runtime.
"""
import io
import json
import subprocess
import sys
from pathlib import Path

import fitz
from PIL import Image

root = Path(__file__).resolve().parents[1]
db, pdf = Path(sys.argv[1]), Path(sys.argv[2])
out = root / 'public/exercise-images'
out.mkdir(parents=True, exist_ok=True)
commit = subprocess.check_output(['git', '-C', str(db), 'rev-parse', 'HEAD'], text=True).strip()
references = {}

def ref(key, dataset=None, title=None, drawing=None):
    item = {'title': title, 'images': []}
    if dataset:
        data = json.loads((db / 'exercises' / (dataset + '.json')).read_text())
        item['title'] = title or data['name']
        item['source'] = {'name': 'Free Exercise DB', 'url': 'https://github.com/yuhonas/free-exercise-db/tree/' + commit + '/exercises/' + dataset, 'license': 'Unlicense', 'revision': commit}
        for i, file in enumerate(data['images']):
            # The collection's first plank photo is a transition, not a plank.
            if key == 'plank' and i == 0:
                (out / 'plank-1.webp').unlink(missing_ok=True)
                continue
            im = Image.open(db / 'exercises' / file).convert('RGB')
            im.thumbnail((720, 720))
            dest = out / f'{key}-{i + 1}.webp'
            im.save(dest, 'WEBP', quality=84, method=6)
            item['images'].append({'src': '/exercise-images/' + dest.name, 'width': im.width, 'height': im.height, 'alt': f'{item["title"]}, reference position {i + 1}', 'label': 'Hold position' if key == 'plank' else f'Position {i + 1}'})
    if drawing:
        page, block = drawing
        b = fitz.open(pdf)[page - 1].get_text('dict')['blocks'][block]
        assert b['type'] == 1
        im = Image.open(io.BytesIO(b['image'])).convert('RGB')
        im.thumbnail((1000, 1000))
        dest = out / f'pdf-{page}-{block}.webp'
        im.save(dest, 'WEBP', quality=90, method=6)
        item['drawing'] = {'src': '/exercise-images/' + dest.name, 'width': im.width, 'height': im.height, 'alt': f'{item["title"]} drawing from Building a Legendary Chest, PDF page {page}', 'label': 'PDF drawing', 'page': page, 'source': 'Building-a-Legendary-Chest.pdf'}
    references[key] = item

ref('bench','Barbell_Bench_Press_-_Medium_Grip',drawing=(9,6))
ref('incline','Incline_Dumbbell_Press',drawing=(10,3))
ref('cable-mid','Cable_Crossover','Shoulder-height cable fly',drawing=(24,11))
references['cable-mid']['photoNote'] = 'Photo uses higher pulleys. Set the pulleys to shoulder height for this program’s mid-height fly.'
ref('cable-low','Low_Cable_Crossover',drawing=(22,11))
ref('cable-high','Cable_Crossover',drawing=(11,7))
ref('incline-close','Hammer_Grip_Incline_DB_Bench_Press','Close-grip incline dumbbell press',drawing=(12,9))
ref('incline-close-2','Hammer_Grip_Incline_DB_Bench_Press','Close-grip incline dumbbell press',drawing=(16,8))
for key in ['incline-close', 'incline-close-2']:
    references[key]['photoNote'] = 'Photo shows a neutral-grip incline press with hands shoulder-width apart. This program specifies a close grip.'
ref('incline-fly','Incline_Dumbbell_Flyes',drawing=(16,7))
ref('cable-press','Standing_Cable_Chest_Press','Standing cable chest press',drawing=(17,9))
ref('cable-fly-2','Cable_Crossover','Cable chest fly',drawing=(17,10))
ref('hammer-press','Leverage_Incline_Chest_Press',title='Lever incline chest press',drawing=(18,8))
ref('smith-flat','Smith_Machine_Bench_Press',drawing=(19,11))
ref('decline-push','Decline_Push-Up',drawing=(19,10))
ref('decline-push-2','Decline_Push-Up','Decline push-up',drawing=(22,10))
ref('barbell-incline','Barbell_Incline_Bench_Press_-_Medium_Grip',drawing=(21,10))
ref('db-flat','Dumbbell_Bench_Press',drawing=(23,10))
ref('push','Pushups',drawing=(24,10))
ref('dip','Dips_-_Chest_Version',title='Parallel-bar dip',drawing=(13,0))
for key, dataset, title in [
 ('machine-fly','Butterfly',None),('wide-pulldown','Wide-Grip_Lat_Pulldown',None),('row','Seated_Cable_Rows',None),('reverse-pulldown','Underhand_Cable_Pulldowns',None),
 ('bb-row','Bent_Over_Barbell_Row',None),('db-stiff','Stiff-Legged_Dumbbell_Deadlift',None),('rope-pulldown','Rope_Straight-Arm_Pulldown',None),
 ('shoulder-press','Dumbbell_Shoulder_Press',None),('lateral','Side_Lateral_Raise',None),('bb-front','Standing_Front_Barbell_Raise_Over_Head',None),
 ('bb-overhead','Standing_Military_Press',None),('upright','Upright_Barbell_Row',None),('rear-machine','Reverse_Machine_Flyes',None),
 ('seated-calf','Seated_Calf_Raise',None),('leg-extension','Leg_Extensions',None),('lying-curl','Lying_Leg_Curls',None),('leg-press','Leg_Press',None),
 ('smith-split','Smith_Single-Leg_Split_Squat',None),('bb-stiff','Stiff-Legged_Barbell_Deadlift',None),('single-extension','Single-Leg_Leg_Extension',None),
 ('seated-curl','Seated_Leg_Curl',None),('walk-lunge','Bodyweight_Walking_Lunge',None),('bb-curl','Barbell_Curl',None),('close-bench','Close-Grip_Barbell_Bench_Press',None),
 ('spider','Dumbbell_Prone_Incline_Curl','Prone incline dumbbell curl'),('db-extension','Standing_Dumbbell_Triceps_Extension',None),('preacher','Machine_Preacher_Curls',None),
 ('pushdown','Triceps_Pushdown',None),('rope-curl','Cable_Hammer_Curls_-_Rope_Attachment',None),('rope-extension','Cable_Rope_Overhead_Triceps_Extension',None),
 ('reverse-curl','Reverse_Barbell_Curl',None),('leg-lift','Flat_Bench_Lying_Leg_Raise',None),('hanging-leg','Hanging_Leg_Raise',None),
 ('crunch','Crunches',None),('decline-crunch','Decline_Reverse_Crunch',None),('smith-incline','Smith_Machine_Incline_Bench_Press',None),
 ('back-extension','Hyperextensions_Back_Extensions',None),('pullup','Pullups',None),('db-row','One-Arm_Dumbbell_Row',None),
 ('single-lateral','One-Arm_Side_Laterals',None),('neutral-press','Standing_Palms-In_Dumbbell_Press',None),('rear-fly','Reverse_Flyes',None),
 ('smith-squat','Smith_Machine_Squat',None),('hack','Hack_Squat',None),('db-lunge','Dumbbell_Lunges',None),('ez-curl','EZ-Bar_Curl',None),
 ('hammer','Hammer_Curls',None),('rope-pushdown','Triceps_Pushdown_-_Rope_Attachment',None),('db-curl','Dumbbell_Bicep_Curl',None),
 ('machine-dip','Dip_Machine',None),('close-push','Push-Ups_-_Close_Triceps_Position',None),('cable-crunch','Cable_Crunch',None),
 ('bicycle','Cross-Body_Crunch','Bicycle crunch'),('deadlift','Barbell_Deadlift',None),('t-row','T-Bar_Row_with_Handle',None),
 ('smith-shoulder','Smith_Machine_Overhead_Shoulder_Press',None),('db-front','Front_Two-Dumbbell_Raise',None),('face-pull','Face_Pull',None),
 ('sumo','Sumo_Deadlift',None),('cable-curl','Standing_Biceps_Cable_Curl',None),('reverse-pushdown','Reverse_Grip_Triceps_Pushdown',None),
 ('squat','Bodyweight_Squat',None),('rdl','Romanian_Deadlift',None),('calf','Standing_Calf_Raises',None),('plank','Plank',None),
]: ref(key,dataset,title)

# Each mapping is deliberate. A nearby variation must disclose its difference.
def R(key, note=None, label=None):
    return {k:v for k,v in {'reference':key,'note':note,'label':label}.items() if v is not None}
ladder=[R('cable-low',label='Low cable fly'),R('cable-mid',label='Mid cable fly'),R('cable-high',label='High cable fly')]
warm=[R('seated-calf'),R('leg-extension'),R('lying-curl')]
spider=R('spider','The photo shows both arms; the program calls for one arm at a time.', 'Single-arm DB spider curl')
reverse=R('reverse-curl','The photo uses a straight bar; the program specifies an E-Z bar.', 'Reverse-grip E-Z bar curl')
front=R('bb-front','Photo includes an overhead finish. Follow the range and instructions in your program; do not add overhead repetitions.')
walking=R('db-lunge','The photos show a forward lunge in place; the program calls for walking steps.', 'DB walking lunge')
underrow=R('row','Photo shows a neutral-grip handle; this program specifies an underhand grip.', 'Underhand seated cable row')
smithlunge=R('smith-split','The photo shows a rear-foot-elevated Smith split squat; the program calls for Smith lunges without specifying elevation.', 'Smith machine lunge')
exercises={}
def group(prefix, items):
    for n, item in enumerate(items,1): exercises[f'source-{prefix}-{n}']=[R(item)] if isinstance(item,str) else item

group('bulk-chest',['bench','incline',ladder,'hammer-press','machine-fly'])
group('bulk-back',['wide-pulldown','row','reverse-pulldown','bb-row','db-stiff','rope-pulldown'])
group('bulk-shoulders',['shoulder-press','lateral',[front],'bb-overhead','upright','rear-machine'])
group('bulk-legs',[warm,'leg-press','smith-split','bb-stiff','single-extension','seated-curl','walk-lunge'])
group('bulk-arms',[[R('bb-curl'),R('close-bench')],[spider,R('db-extension')],[R('preacher'),R('pushdown')],[R('rope-curl'),R('rope-extension')],[reverse,R('dip')]])
group('legendary-chest-weeks-1-4',['bench','incline','cable-high','incline-close','dip'])
group('legendary-chest-weeks-5-8',['incline',[R('incline-close-2'),R('incline-fly')],[R('cable-press'),R('cable-fly-2')],'hammer-press',[R('smith-flat'),R('decline-push')]])
group('legendary-chest-weeks-9-12',['barbell-incline',[R('cable-low'),R('decline-push-2')],[R('db-flat', 'The photo shows a full repetition, not the prescribed isometric hold.'),R('bench','The PDF heading mentions barbell flat bench but supplies no separate sets for it. This picture adds no prescription.')],[R('cable-mid'),R('push','The picture shows a standard push-up. Apply the tension hold and partial-rep instructions from the source.', 'Tension / partial-rep push-up')]])
legs=[R('leg-lift','Photo uses a flat bench; the source permits lying leg lifts.'),R('hanging-leg',label='Advanced: hanging leg lift')]
group('shred-phase-1-abs',[legs,'crunch','decline-crunch'])
group('shred-phase-1-chest',['cable-high','incline',ladder+[R('push')],'smith-incline','machine-fly'])
group('shred-phase-1-back',['back-extension','pullup',[R('bb-row'),R('bb-stiff')],'reverse-pulldown','db-row','wide-pulldown','back-extension'])
group('shred-phase-1-shoulders',['shoulder-press','lateral','single-lateral','neutral-press','rear-fly','rear-machine'])
group('shred-phase-1-legs',[warm,[R('smith-squat','Use the close stance printed in the program; the photo illustrates the base Smith squat.')],'hack',[walking],'lying-curl'])
group('shred-phase-1-arms',[[R('ez-curl'),R('pushdown')],[R('hammer'),R('rope-pushdown')],[spider,R('db-extension')],[R('db-curl'),R('machine-dip')],[R('bb-curl'),R('close-push')]])
group('shred-phase-2-abs',[legs,'cable-crunch','decline-crunch','bicycle'])
group('shred-phase-2-chest',['smith-incline','incline-close',[R('cable-fly-2'),R('cable-press')],'smith-incline',[R('machine-fly'),R('push')]])
group('shred-phase-2-back',['deadlift','wide-pulldown','db-row','t-row',[underrow],'rope-pulldown','back-extension'])
group('shred-phase-2-shoulders',['smith-shoulder','lateral',[R('db-front','Photo shows palms down. The source specifies thumbs up with both arms moving together.', 'Thumbs-up DB front raise')],[front],'rear-fly',[R('face-pull'),R('rear-fly')]])
group('shred-phase-2-legs',[warm,'leg-press',[smithlunge],'sumo',[R('seated-curl'),R('leg-extension')]])
group('shred-phase-2-arms',[[R('bb-curl'),R('close-bench')],[R('preacher'),R('machine-dip')],[R('cable-curl'),R('reverse-pushdown')],[reverse,R('rope-extension')]])
for key, refkey in {'curl':'db-curl','hammer':'hammer','bench':'bench','incline':'incline','press':'shoulder-press','raise':'lateral','pulldown':'wide-pulldown','row':'row','squat':'squat','rdl':'rdl','lunge':'db-lunge','pushdown':'pushdown','calf':'calf','plank':'plank'}.items():exercises[key]=[R(refkey)]
# Disclose equipment or support differences in references.
for entries in exercises.values():
    for entry in entries:
        if entry['reference'] == 'rear-fly':
            entry['note'] = 'Photo shows an incline-bench-supported rear delt fly; the program calls for a bent-over rear delt fly.'
# Do not show an unrelated movement for these two home-only library exercises.
missing={'wall-push':'An exact wall push-up photo is not available in the supplied PDFs or the licensed collection. Follow the wall-specific checkpoints below.', 'prone-w':'An exact prone W raise photo is not available in the supplied PDFs or the licensed collection. Follow the W-position checkpoints below.'}
source=json.loads((root/'src/data/buendia-programs.json').read_text())
expected={e['id'] for p in source for ph in p['phases'] for w in ph['workouts'] for e in w['exercises']}
assert expected <= exercises.keys(), expected-exercises.keys()
(root/'src/data/exercise-media.json').write_text(json.dumps({'references':references,'exercises':exercises,'missing':missing},indent=2)+'\n')
(out/'LICENSE-Free-Exercise-DB.txt').write_text((db/'LICENSE.md').read_text())
print(f'{len(expected)} source blocks, {len(exercises)} pictured exercise entries, {len(references)} references; {len(missing)} explicitly unavailable home-exercise references.')
