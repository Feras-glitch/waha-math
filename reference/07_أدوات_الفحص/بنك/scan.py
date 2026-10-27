# يحدد حدود عبارات البنك: const CB = {...}; و Object.assign(CB, {...});
import re
def match_close(s, i, open_ch, close_ch):
    """i عند الحرف الفاتح؛ يعيد موضع الحرف المغلق المطابق مع تجاهل النصوص والتعليقات والقوالب"""
    depth=0; n=len(s); j=i
    stack=[]  # لقوالب ${ }
    while j<n:
        c=s[j]
        if c in '"\'':
            q=c; j+=1
            while j<n and s[j]!=q:
                if s[j]=='\\': j+=1
                j+=1
        elif c=='`':
            j+=1
            while j<n and s[j]!='`':
                if s[j]=='\\': j+=2; continue
                if s[j]=='$' and j+1<n and s[j+1]=='{':
                    k=match_close(s,j+1,'{','}'); j=k+1; continue
                j+=1
        elif c=='/' and j+1<n and s[j+1]=='/':
            j=s.index('\n',j)
        elif c=='/' and j+1<n and s[j+1]=='*':
            j=s.index('*/',j)+1
        elif c=='/' :
            # تعبير نمطي محتمل: نتحقق من الحرف السابق غير الفارغ
            k=j-1
            while k>=0 and s[k] in ' \t\n': k-=1
            if k<0 or s[k] in '(,=:[!&|?{};+-*%<>~^':
                j+=1; inclass=False
                while j<n:
                    if s[j]=='\\': j+=2; continue
                    if s[j]=='[': inclass=True
                    elif s[j]==']': inclass=False
                    elif s[j]=='/' and not inclass: break
                    j+=1
        elif c==open_ch: depth+=1
        elif c==close_ch:
            depth-=1
            if depth==0: return j
        j+=1
    raise ValueError('unbalanced at %d'%i)
def bank_statements(s):
    out=[]
    m=re.search(r'const CB = \{',s)
    o=m.end()-1; e=match_close(s,o,'{','}')
    end=e+1
    while s[end] in ' \t': end+=1
    if s[end]==';': end+=1
    out.append((m.start(),end,'const'))
    for m in re.finditer(r'Object\.assign\(CB,\s*',s):
        p=m.start()+len('Object.assign')
        e=match_close(s,p,'(',')'); end=e+1
        if end<len(s) and s[end]==';': end+=1
        out.append((m.start(),end,'assign'))
    return sorted(out)
if __name__=='__main__':
    import sys
    s=open(sys.argv[1],encoding='utf-8').read()
    st=bank_statements(s)
    for a,b,k in st:
        line=s.count('\n',0,a)+1; lines=s.count('\n',a,b)
        print(k,'line',line,'+',lines,'chars',b-a, repr(s[b-15:b]))
