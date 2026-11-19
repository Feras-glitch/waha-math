import json, os
ROOT='/home/claude/waha-math'
def dump(path, obj):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    json.dump(obj, open(path,'w'), ensure_ascii=False, indent=1); open(path,'a').write('\n')
def merge_json(path, fn):
    d=json.load(open(path)); fn(d); json.dump(d, open(path,'w'), ensure_ascii=False, indent=1); open(path,'a').write('\n')
