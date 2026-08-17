# CENTRALSync - Proje Yönetim Sistemi

**Heweso Staj Projesi**

Bu proje, organizasyonel yapı içerisindeki kullanıcı yönetimi, proje yaşam döngüsü, ekip üyeliği, görev atama ve zaman takibi süreçlerini dijitalleştiren kapsamlı bir **Proje Yönetim Sistemi** backend/API uygulamasıdır.

Uygulama, salt CRUD işlemlerinin ötesine geçerek kurumsal standartlara yakın bir mimari, rol bazlı yetkilendirme ve detaylı iş kuralları barındırmaktadır.

---

## 🏗️ Mimari Yaklaşım ve Tasarım Kararları

Projede sürdürülebilir, okunabilir ve test edilebilir bir yapı kurmak amacıyla **Repository Pattern + Service Layer** mimarisi benimsenmiştir.

### İnce Controller Yapısı

Controller katmanı yalnızca request/response koordinasyonunu gerçekleştirecek şekilde ince tutulmuş, iş kuralları servis katmanına taşınmıştır.

### Repository Soyutlaması

Veritabanı işlemleri Repository katmanı üzerinden gerçekleştirilerek uygulama mantığına bir soyutlama katmanı sağlanmıştır. Bu sayede Controller katmanının kullanılan veritabanı teknolojisini (SQL Server, MongoDB vb.) doğrudan bilmesine gerek kalmaz. Ayrıca ileride caching veya batching gibi optimizasyonların eklenmesine zemin hazırlanır.

### DTO Kullanımı

Veritabanı Entity modelleri güvenlik ve esneklik gereği doğrudan API çıktısı olarak kullanılmamış, bunun yerine **DTO (Data Transfer Object)** yaklaşımı tercih edilmiştir.

---

## 🗄️ Veritabanı ve Optimizasyon Notları

Uygulama ORM olarak **Entity Framework Core** ve veritabanı olarak **SQL Server** kullanmaktadır. Domain model sınıflarının tablo oluşumlarında temel kısıtlar Data Annotations ile sağlanmıştır.

### Özel Veritabanı Kararları

- **İki Katmanlı Validasyon:** Veri bütünlüğünü sağlamak amacıyla kritik kısıtlar DbContext üzerinde **Fluent API** ile, kullanıcı girişlerinin doğrulanması ise DTO seviyesinde **FluentValidation** ile tasarlanmıştır.
- **Karakter Limitleri:** `NVARCHAR(MAX)` tipindeki alanlara `UNIQUE` index konulamayacağı için `Users` tablosundaki `Email` alanına 255 karakter sınırı getirilmiştir. Hash'lenmiş şifrelerin uzunluğu da kontrol altında tutulmak amacıyla `PasswordHash` alanına 255 karakterlik limit konulmuştur.
- **Hassas Sayısal Veriler:** `Tasks` ve `TaskTimeLogs` tablolarındaki `EstimatedHours` ve `Hours` alanlarında silent truncating (sessiz veri kaybı) riskini engellemek ve kontrollü bir işlem mekanizması sağlamak amacıyla Fluent API ile `decimal(18,2)` limiti uygulanmıştır.
- **Benzersizlik (Unique Index):** Bir kullanıcının aynı projeye birden fazla kez eklenmesini önlemek için `ProjectMembers` tablosunda `ProjectId + UserId` bazlı unique index oluşturulmuştur.

---

## 🔐 Kimlik Doğrulama ve Güvenlik

Sistem **JWT (JSON Web Token)** tabanlı kimlik doğrulama kullanmaktadır.

### Authentication

Kullanıcının e-posta ve şifre bilgileriyle sisteme giriş yapmasını ifade eder.

### Authorization

Giriş yapmış kullanıcının rollerine ve proje içi yetkilerine göre hangi verilere ve işlemlere erişebileceğini belirler.

### Performans Optimizasyonu

Kullanıcının `FullName` bilgisi, gereksiz veritabanı sorgularından kaçınmak amacıyla doğrudan JWT içerisindeki claim'lerden okunmaktadır.

---

## 🚀 Ekstra Özellikler ve Gerekçelendirilmiş İş Kuralları

Staj teknik dokümanında yer alan, gerekli durumlarda ek alanların eklenebileceği ancak bu eklemelerin README içerisinde gerekçelendirilmesi gerektiği kuralına istinaden projeye aşağıdaki mantıksal eklentiler yapılmıştır.

### 1. Global `Viewer` Rolü

Dokümanda proje içi bir rol olarak geçen `Viewer` (Gözlemci) rolü, şirket içi genel takip süreçlerini desteklemek amacıyla sistem (`User`) düzeyinde de bir role genişletilmiştir.

Global role'ü `Viewer` olan kullanıcılar, dahil oldukları projelerde otomatik olarak **read-only** davranır. Projeye eklenirken proje rolleri `Viewer` olarak zorlanır; global Viewer kullanıcıları `Member` veya `Contributor` olarak projeye yükseltilemez.

### 2. Geçmiş Tarihe Görev Atanamaması (`DueDate` Kuralı)

Mantıksal bütünlüğü korumak amacıyla görevlerin son teslim tarihi (`DueDate`) için geçmiş bir tarih seçilmesi engellenmiştir. Böylece sisteme manuel olarak gecikmiş görevlerin oluşturulmasının önüne geçilmesi amaçlanmıştır.

### 3. Shallow Nesting (Sığ İç İçe Geçme)

Yorumların (`Comments`) güncellenmesi ve silinmesi işlemlerinde benzersiz `Guid` kullanıldığı için URL yapısında `/tasks/{taskId}/comments/{id}` gibi derin bir yapı tercih edilmemiş, işlemler doğrudan yorum ID'si üzerinden gerçekleştirilmiştir.

### 4. Genişletilmiş Endpoint'ler

- `GET All Tasks` endpoint'ine veritabanı yükünü azaltmak amacıyla **pagination (sayfalama)** eklenmiştir.
- `ProjectsController` tarafına projedeki üyeleri getiren özel bir `GET` endpoint'i eklenmiştir.

---

## 🔑 Rol ve Yetkilendirme Modeli

Sistem iki farklı yetki seviyesini birlikte kullanır:

### Global Kullanıcı Rolü

Kullanıcının sistem genelindeki maksimum yetki seviyesini belirler.

- `Admin`
- `ProjectManager`
- `TeamMember`
- `Viewer`

Global `Viewer`, sistem genelinde write işlemlerini gerçekleştiremez.

### Proje İçi Rol

Kullanıcının belirli bir proje içerisindeki rolünü belirler.

- `Member`
- `Contributor`
- `Viewer`

Global rol, proje içi rol için üst sınır oluşturur. Özellikle global `Viewer` olan bir kullanıcı herhangi bir projeye eklendiğinde otomatik olarak `Viewer` proje rolüyle eklenir.

Bunun sonucu olarak global `Viewer` olan bir kullanıcı:

- Projenin görevlerini ve ilgili verileri görüntüleyebilir.
- Kendisine görev atanamaz.
- Yorum ekleyemez.
- Zaman kaydı ekleyemez.
- Görev üzerinde write işlemleri gerçekleştiremez.

Proje içindeki `Viewer`, `Member` ve `Contributor` rollerinin görünürlük ve yazma yetkileri proje üyeliğine göre uygulanır.

---

## 📋 TaskHistory (`ChangeType`) Enum Değerleri

Görevler üzerindeki değişikliklerin geçmişini tutan `TaskHistories` tablosunda `ChangeType` alanı `Enum` olarak tasarlanmıştır.

Kullanılan değerler:

- `StatusChanged` — Görevin durumu değiştirildiğinde.
- `AssignedUserChanged` — Göreve atanan kullanıcı değiştirildiğinde.
- `PriorityChanged` — Görevin öncelik seviyesi değiştirildiğinde.
- `Updated` — Görevin metinsel detayları (başlık, açıklama vb.) güncellendiğinde.

---

## 💻 Lokal Ortamda Kurulum ve Çalıştırma (Backend)

Projenin güvenliği gereği JWT Secret Key kaynak kod kontrolünde (GitHub vb.) tutulmamaktadır.

Projeyi lokal ortamda test edebilmek için kendi ortamınızda **.NET User Secrets** kullanarak bir Secret Key tanımlamanız gerekir.

> Canlı (Production) ortamında bu verinin Azure Key Vault gibi güvenli bir ortamda saklanması planlanmıştır.

### 1. Backend klasörüne gidin

`CentralSync.API` klasörünün dizininde terminal açın.

### 2. User Secrets özelliğini başlatın

Daha önce başlatılmadıysa:

```bash
dotnet user-secrets init
```

### 3. JWT Secret Key tanımlayın

Kendi lokal geliştirme anahtarınızı belirleyin:

```bash
dotnet user-secrets set "Jwt:Key" "kendi-lokal-test-anahtarinizi-buraya-yazin-en-az-32-karakter"
```

### 4. Veritabanını oluşturun / güncelleyin

Entity Framework Core migration'larını uygulamak için:

```bash
dotnet ef database update
```

### 5. Backend'i çalıştırın

```bash
dotnet run
```

API, Swagger üzerinden test edilebilir:

```text
https://localhost:<port>/swagger
```

---

## 🌐 Frontend Üzerinden Test Etme

Sistemi yalnızca Swagger üzerinden değil, gerçek bir kullanıcı deneyimiyle test edebilmek için projeye React tabanlı bir frontend de dahil edilmiştir.

Backend API ayağa kaldırıldıktan sonra frontend'i çalıştırmak için:

### 1. Frontend klasörüne gidin

Yeni bir terminal açıp:

```bash
cd CentralSync.Frontend
```

### 2. Gerekli NPM paketlerini yükleyin

```bash
npm install
```

### 3. Development sunucusunu başlatın

```bash
npm run dev
```

### 4. Uygulamayı açın

Terminalde gösterilen adrese tarayıcıdan gidin. Örneğin:

```text
http://localhost:5173
```

veya

```text
http://localhost:3000
```

Frontend üzerinden login, proje yönetimi, ekip üyeliği, görev yönetimi, Kanban, yorumlar ve zaman kayıtları gibi API özellikleri gerçek kullanıcı akışı üzerinden test edilebilir.

---

## 🧪 Test ve Geliştirme Notları

Uygulama geliştirilirken hem Swagger üzerinden API endpoint'leri hem de React frontend üzerinden gerçek kullanıcı senaryoları test edilebilir.

Özellikle aşağıdaki yetki senaryolarının doğrulanması önerilir:

- Admin kullanıcı ile proje oluşturma ve proje yönetimi.
- ProjectManager ile proje ve görev yönetimi.
- TeamMember ile proje görevlerini görüntüleme ve yetkili etkileşimler.
- Project içi `Viewer` kullanıcısının read-only davranışı.
- Global `Viewer` kullanıcısının herhangi bir projede otomatik olarak `Viewer` rolüyle tutulması.
- Proje üyesi olmayan kullanıcıların ilgili proje ve görevlerine erişememesi.
- Time log filtrelerinin kullanıcı, görev ve tarih aralığına göre çalışması.

---

## 📁 Genel Proje Yapısı

Backend tarafında temel katmanlar aşağıdaki sorumluluklara ayrılmıştır:

```text
CentralSync.API
├── Controllers
├── Services
│   ├── Abstract
│   └── Concrete
├── Repositories
│   ├── Abstract
│   └── Concrete
├── Models
│   ├── Domain
│   └── DTO
├── Data
└── ...
```

Frontend tarafı React tabanlıdır ve sayfa/layout ayrımı üzerinden yapılandırılmıştır.

---

## 📌 Not

Bu proje, **Heweso Staj Projesi** kapsamında geliştirilmiş bir Proje Yönetim Sistemi uygulamasıdır. Mimari kararlar, güvenlik kuralları ve iş kuralları projenin teknik dokümanında belirtilen gereksinimler doğrultusunda uygulanmıştır.
