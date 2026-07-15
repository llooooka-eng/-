# تألق (Talluq)

تطبيق حجز مواعيد صالونات الحلاقة والتجميل (رجال، نساء، أطفال، وخدمة منزلية) — عربي أولاً (RTL).
هذا المستودع يضمّ **مواصفة التصميم**، **كود التطبيق** (React Native / Expo)، بالإضافة إلى **أدوات ذكاء تصميم UI/UX** وإعداد **خوادم MCP** لتسريع العمل داخل Claude Code.

---

## محتويات المستودع

| الملف / المجلد | الوصف |
|---|---|
| `Talluq-Design.md` | دليل التصميم الكامل: التوكنات (ألوان Pearl/Ink/Gold، الطباعة، المسافات، الحركة)، المكوّنات، والشاشات. |
| `files.zip` | ملفات تطبيق Talluq بـ React Native / Expo (شاشات، خدمات الحجز والمحفظة، الثيم). |
| `.mcp.json` | إعداد خوادم MCP للمشروع (GitHub + Figma). |
| `.claude/skills/` | مهارة **UI/UX Pro Max** ومهاراتها الفرعية لذكاء التصميم. |

---

## مهارة UI/UX Pro Max

مهارة ذكاء تصميم بقاعدة بيانات محلية قابلة للبحث: أنماط UI، لوحات ألوان، أزواج خطوط، إرشادات UX، وأنواع رسوم بيانية عبر عدّة تقنيات (من ضمنها **React Native** المستخدمة في هذا التطبيق).

**المهارة الرئيسية:** `.claude/skills/ui-ux-pro-max/`
**مهارات فرعية مرفقة:** `banner-design` · `brand` · `design` · `design-system` · `slides` · `ui-styling`

### الاستخدام
تعمل عبر Python 3 (مكتبة قياسية فقط — بلا اتصال شبكي):

```bash
# اقتراح نمط لشاشة
python3 .claude/skills/ui-ux-pro-max/scripts/search.py --domain style "booking app"

# لوحة ألوان + توليد نظام تصميم
python3 .claude/skills/ui-ux-pro-max/scripts/search.py --domain color "beauty salon" --design-system

# أفضل ممارسات لتقنية معيّنة
python3 .claude/skills/ui-ux-pro-max/scripts/search.py --stack react-native "navigation"
```

> على ويندوز استخدم `python` بدل `python3`.
> تظهر المهارة تلقائيًا في Claude Code بعد إعادة تحميل المشروع.

---

## خوادم MCP

مُعرّفة في `.mcp.json` بنطاق المشروع (تُشارَك مع كل من يستخدم المستودع):

| الخادم | الغرض | الرابط | المصادقة |
|---|---|---|---|
| **github** | إدارة المستودع، الـ PRs، الـ issues | `https://api.githubcopilot.com/mcp/` | OAuth |
| **figma** | التصميم، design-to-code، بناء نظام التصميم | `https://mcp.figma.com/mcp` | OAuth |

كلاهما يعتمد **OAuth** — لا يُخزَّن أي مفتاح سرّي في المستودع.

### التفعيل (مرة واحدة، في جلسة تفاعلية)
```bash
/mcp              # داخل Claude Code: اختر الخادم ثم Approve / Authenticate
claude mcp list   # للتأكد من أن الحالة صارت: ✔ connected
```

> خوادم `.mcp.json` للمشروع تظهر أول مرة كـ `⏸ Pending approval` لأسباب أمنية — وافِق عليها من جلسة تفاعلية.
> في جلسات Claude Code على الويب، يُضبط أي مفتاح/سرّ مطلوب كمتغيّر بيئة في إعدادات البيئة، لا في هذا الملف.

#### إضافة خادم آخر لاحقًا
```bash
claude mcp add --scope project --transport http <name> <url>
# مثال بمفتاح API عبر placeholder (لا تكتب السرّ في الملف):
claude mcp add --scope project --transport http <name> <url> --header "x-api-key: \${MY_API_KEY}"
```

---

## نظام التصميم (مرجع سريع)

مفصّل بالكامل في [`Talluq-Design.md`](./Talluq-Design.md):

- **الألوان:** لؤلؤي دافئ (Pearl) + حبري داكن (Ink) + ذهبي مقتصد للإبراز (Gold).
- **الخطوط:** `IBM Plex Sans Arabic` — بلا letter-spacing على العربي.
- **RTL أولاً**، شبكة أساس 4px، هدف لمس ≥ 44px، ثيم فاتح + داكن.
