# Замена процедурной комнаты на GLB

Положите оптимизированную модель в `public/models/room.glb`.

Желательные имена групп:

- `RoomShell`
- `ConcreteWalls`
- `FinishedWalls`
- `FloorRaw`
- `FloorFinished`
- `Ceiling`
- `Lighting`
- `Sofa`
- `Armchair`
- `CoffeeTable`
- `Curtains`
- `Plants`
- `Decor`
- `Rug`
- `Textiles`

Сайт уже проверяет наличие файла автоматически:

- если `public/models/room.glb` есть, загружается GLB;
- если файла нет или он битый, остается процедурная демо-комната.

Логика переключения находится в `src/components/hero/RoomCanvas.tsx`.
Компонент загрузки модели находится в `src/components/hero/GLBRoom.tsx`.

Этапы появления объектов настраиваются в `src/config/room-stages.ts`. Чтобы добавить объект, внесите его имя в массив `objects` нужного этапа. Если имя объекта в GLB совпадает с именем в `objects`, он будет появляться по scroll timeline автоматически.

Если GLB скачан как один цельный объект, он не сможет собираться по частям. Откройте его в Blender, разделите мебель/свет/шторы/декор на отдельные объекты и задайте им имена из списка выше.

Перед публикацией сожмите GLB через Draco или Meshopt, уменьшите текстуры до WebP/AVIF и проверьте мобильный DPR.
