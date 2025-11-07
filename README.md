# K PLUS Deep Link Handler

JavaScript library สำหรับเปิดแอป K PLUS ผ่าน deep link พร้อมระบบ fallback ที่จะพาผู้ใช้ไปยัง App Store หรือ Play Store หากไม่สามารถเปิดแอปได้

## Features

- ✅ เปิดแอป K PLUS ด้วย authentication token
- ✅ ตรวจจับ platform (iOS/Android) อัตโนมัติ
- ✅ Fallback ไปยัง App Store/Play Store เมื่อเปิดแอปไม่ได้
- ✅ รองรับทั้ง Promise-based และ Timer-based approaches
- ✅ ใช้งานง่าย พร้อม global functions

## การติดตั้ง

```html
<script src="kplus-deeplink.js"></script>
```

## การใช้งาน

### วิธีง่าย ๆ (แนะนำ)

```javascript
// วิธีง่ายที่สุด - เปิด K PLUS และจัดการ fallback อัตโนมัติ
openKPlus('your-token');

// กำหนดเวลารอก่อน fallback (default: 2500ms)
openKPlus('your-token', 5000);
```

### การใช้งานแบบ Advanced

```javascript
// ใช้ instance โดยตรง
kplusHandler.openKPlusApp('your-token');

// ตรวจสอบ platform
const platform = kplusHandler.detectPlatform();
console.log('Platform:', platform); // 'ios', 'android', หรือ 'unknown'

// เปิด app store โดยตรง
kplusHandler.handleFallback();
```

## API Reference

### `KPlusDeepLinkHandler`

#### Methods

##### `openKPlusApp(token, fallbackDelay)`
เปิดแอป K PLUS พร้อมจัดการ fallback อัตโนมัติ

**Parameters:**
- `token` (string, required): Authentication token
- `fallbackDelay` (number, optional): หน่วงเวลาก่อน fallback (default: 2500ms)

**Example:**
```javascript
kplusHandler.openKPlusApp('abc123', 3000);
```

##### `detectPlatform()`
ตรวจจับ platform ปัจจุบัน

**Returns:** 
- `string`: 'ios', 'android', หรือ 'unknown'

**Example:**
```javascript
const platform = handler.detectPlatform();
console.log('Platform:', platform);
```

##### `handleFallback()`
เปิด App Store หรือ Play Store ตาม platform

**Example:**
```javascript
handler.handleFallback();
```

### Global Functions

```javascript
// ฟังก์ชันสำหรับใช้งานง่าย
openKPlus(token, delay);
```

## Deep Link URL Format

แอปจะถูกเปิดด้วย URL รูปแบบ:
```
kbank.kplus://authenwithkplus?tokenId={{token}}&nextAction=authenwithkplus
```

## Fallback URLs

เมื่อไม่สามารถเปิดแอปได้ ระบบจะเปิด:

- **iOS**: `https://apps.apple.com/app/id361170631`
- **Android**: `https://play.google.com/store/apps/details?id=com.kasikorn.retail.mbanking.wap`

## ตัวอย่างการใช้งาน

```bash
# เปิดไฟล์ตัวอย่าง
open index.html
```

## การทำงานของระบบ Fallback

ใช้ Visibility API ร่วมกับ Timer เพื่อตรวจสอบว่าผู้ใช้เปลี่ยนไปใช้แอปหรือไม่ หากไม่ได้เปลี่ยนภายในเวลาที่กำหนด จะเปิด App Store อัตโนมัติ

## Browser Support

- ✅ Chrome (mobile & desktop)
- ✅ Safari (mobile & desktop)  
- ✅ Firefox (mobile & desktop)
- ✅ Edge
- ✅ Samsung Internet

## License

MIT License

## Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
