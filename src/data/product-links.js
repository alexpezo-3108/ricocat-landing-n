/**
 * Links directos por producto (fuente: ricocat-links-v3_2.json). Clave = id de products.js.
 * "revisar" = el cliente marcó el link para validar (presentación o sabor puede no coincidir exacto).
 * pate-carne-180 no tiene links en la matriz → el selector muestra el mensaje de "sin tiendas".
 */
export const PRODUCT_LINKS = {
  'seco-atun': [ // S1 ALIMENTO SECO SABOR ATÚN, SARDINA Y TRUCHA – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-atun-sardina-y-trucha-bolsa-1kg/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113366080/ricocat-alimento-de-atun-sardina-y-trucha-para-gatos-de-1-a-mas-anos-40450991/113366081' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-adulto-atun-sardina-trucha-1kg/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-atun-sardina-y-trucha-bolsa-1kg/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco/ricocat-adultos-atun-sardina-y-trucha-alimento-seco-gato/AG000144_m.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-adulto-atun-sardina-y-trucha/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-atun-sardina-y-trucha-15-kg-20200322/p' },
  ],
  'seco-festival': [ // S2 ALIMENTO SECO FESTIVAL DE SABORES – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-festival-de-sabores-bolsa-1kg/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113366919/ricocat-festival-de-sabores-1kg/113366920' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-alimento-para-gatos-adultos-festival-de-sabores-bolsa-1-kg/p' },
    { id: 'wong', url: 'https://www.wong.pe/ricocat-alimento-para-gatos-adultos-festival-de-sabores-bolsa-1-kg-2/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco/ricocat-adultos-festival-de-sabores-alimento-seco-gato/AG000149_m.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-adulto-festival-de-sabores/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-festival-de-sabores-9-kg-20200325/p' },
  ],
  'seco-esterilizados': [ // S3 ALIMENTO SECO ESTERILIZADOS – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-esterilizados-bolsa-1kg/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113369340/ricocat-esterilizados-05kg/113369341' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-alimento-para-gatos-adultos-esterilizados-bolsa-1-kg/p' },
    { id: 'wong', url: 'https://www.wong.pe/ricocat-alimento-para-gatos-adultos-esterilizados-bolsa-1-kg-2/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-esterilizados-bolsa-1kg-42409/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco/ricocat-adultos-esterilizados-alimento-seco-gato/AG000152_m.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-adulto-esterilizado/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-esterilizado-9-kg-20200324/p' },
  ],
  'seco-pollo': [ // S4 ALIMENTO SECO SABOR POLLO, SARDINA Y SALMÓN – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-sabor-pollo-sardina-y-salmon-bolsa-1kg/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113371086/ricocat-croquetas-sabor-pollo-sardina-y-salmon-para-gato-adulto-41876540/113371087' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-alimento-para-gatos-adultos-pollo-sardina-y-salmon-bolsa-1-kg/p' },
    { id: 'wong', url: 'https://www.wong.pe/ricocat-alimento-para-gatos-adultos-pollo-sardina-y-salmon-bolsa-9-kg-2/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-sabor-pollo-sardina-y-salmon-bolsa-1kg-42437/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco/ricocat-adultos-pollo-sardina-y-salmon-1-kg/AG000141.html' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pollo-sardina-y-salmon-9-kg-20200327/p' },
  ],
  'seco-carne-salmon': [ // S5 ALIMENTO SECO SABOR CARNE, SALMÓN Y LECHE – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-carne-salmon-y-leche-bolsa-1kg/p' },
    { id: 'tottus', url: 'https://www.tottus.com.pe/tottus-pe/articulo/115845378/RICOCAT%20CARNE%20SALMON%20Y%20LECHE%20X%201KG/115845379' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-alimento-para-gatos-adultos-carne-salmon-y-leche-bolsa-1-kg/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-carne-salmon-y-leche-bolsa-1kg-42410/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco/ricocat-adultos-carne-salmon-y-leche-alimento-seco-gato/AG000146_m.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-adulto-carne-salmon-y-leche/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-carne-salmon-y-leche-9-kg-20200323/p' },
  ],
  'seco-gatitos': [ // S6 ALIMENTO SECO SABOR CARNE, PESCADO Y LECHE – GATITOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-gatitos-carne-pescado-y-leche-bolsa-1kg/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113379113/comida-para-gatitos-ricocat-sabor-carne-pescado-y-leche-1-kg/113379114' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-gatito-carne-pescado-y-leche-3kg/p' },
    { id: 'wong', url: 'https://www.wong.pe/alimento-para-gatitos-ricocat-carne-pescado-y-leche-3kg/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-gatitos-carne-pescado-y-leche-bolsa-1kg/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-seco/ricocat-gatitos-carne-pescado-y-leche-alimento-seco-gato/AG000155_m.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-gatitos-carne-pescado-y-leche/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-gatitos-15-kg-20200330/p' },
  ],
  'pate-gatitos-180': [ // H1 PATÉ SABOR POLLO Y CARNE 180 G – GATITOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-gatitos-pollo-y-carne-lata-180g/p' },
    { id: 'tottus', url: 'https://www.tottus.com.pe/tottus-pe/articulo/126571947/Ricocat-Pate-Sabor-Pollo-Carne-Gatitos-Lata-180-g' },
    { id: 'promart', url: 'https://www.promart.pe/alimento-humedo-para-gato-ricocat-gatito-sabor-pollo-y-carne-lata-180g-1001359232/p' }, // revisar
  ],
  'trocitos-carne-lata': [ // H2 TROCITOS EN SALSA SABOR CARNE 190 G – GATITOS
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-gatitos-trocitos-sabor-carne-190gr/' },
    { id: 'metro', url: 'https://www.metro.pe/trocitos-en-salsa-ricocat-sabor-carne-190g-1002214/p' }, // revisar
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-cachorro-todas-las-razas-carne-lata-190g/p' }, // revisar
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-carne-gatitos-trocitos-160-gr-20200342/p' }, // revisar
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-trocitos-en-salsa-carne-para-gatitos/' }, // revisar
  ],
  'trocitos-carne-pouch': [ // H3 TROCITOS EN SALSA SABOR CARNE 85 G – GATITOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-trocitos-carne-gatitos-pocuh-85-g/p' },
    { id: 'wong', url: 'https://www.wong.pe/pouc-ricocat-troz-sals-carne-gatti-x-85gr/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-cachorro-trocitos-salsa-en-carne-pouch-85-g/AG000264.html' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-trocitos-en-salsa-de-carne-para-gatitos/' }, // revisar
  ],
  'pate-higado-pollo-330': [ // H4 PATÉ SABOR HÍGADO Y POLLO 330 G – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-pate-higado-y-pollo-lata-330g/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113368729/ricocat-higado-y-pollo-latax1164-oz/113368730' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-pate-para-gatos-adultos-higado-y-pollo-lata-330-gr/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-pate-higado-y-pollo-lata-330g/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-adulto-pate-higado-pollo-alimento-humedo-gato/AG000256_m.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-pate-higado-y-pollo-330gr/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pate-higado-y-pollo-lata-330-gr-20170333/p' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-pate-higado-y-pollo-alimento-para-gatos/' },
  ],
  'pate-pavo-higado-330': [ // H5 PATÉ SABOR PAVO E HÍGADO 330 G – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-pate-pavo-e-higado-lata-330g/p' },
    { id: 'tottus', url: 'https://www.tottus.com.pe/tottus-pe/articulo/113368870/pate-para-gatos-adultos-ricocat-sabor-higado-y-pavo-330-g/113368871' },
    { id: 'wong', url: 'https://www.wong.pe/ricocat-pate-para-gatos-adultos-pavo-e-higado-lata-330-gr-2-2/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-pate-pavo-e-higado-lata-330g/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-adulto-pate-pavo-higado-330-g/AG000257.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-pate-pavo-e-higado-330gr/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pate-pavo-e-higado-lata-330-gr-20170334/p' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-pate-higado-y-pavo-alimento-para-gatos/' },
  ],
  'pate-sardina-pollo-330': [ // H6 PATÉ SABOR SARDINA Y POLLO 330 G – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-adultos-pate-sardina-y-pollo-lata-330g/p' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-pate-para-gatos-adultos-sardina-y-pollo-lata-330-gr/p' },
    { id: 'wong', url: 'https://www.wong.pe/ricocat-pate-para-gatos-adultos-sardina-y-pollo-lata-330-gr-2-2/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-adultos-pate-sardina-y-pollo-lata-330g/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-adulto-pate-sardina-pollo-330-g/AG000259.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-pate-sardina-y-pollo-330gr/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pate-sardina-y-pollo-lata-330-gr-20170332/p' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-pate-sardina-y-pollo-alimento-para-gatos/' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/116167881/ricocat-premium-pescado-y-pollo-x-1164oz/116167883' }, // revisar
  ],
  'pate-atun-180': [ // H7 PATÉ SABOR ATÚN Y PESCADO 180 G – ADULTOS
    { id: 'promart', url: 'https://www.promart.pe/pate-para-gato-adulto-ricocat-atun-y-pescado-180gr-1001132008/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-atun-y-pescado-adulto-pate-lta-5.64-oz-159-g/AG000514.html' }, // revisar
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pate-atun-y-pescado-160-gr-20200338/p' }, // revisar
    { id: 'makro', url: 'https://www.makro.plazavea.com.pe/alimento-humedo-para-gato-ricocat-adulto-sabor-atun-y-pescado-lata-180g/p' }, // revisar
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-pate-atun-y-pescado-alimento-para-gatos/' }, // revisar
    { id: 'mascota-veloz', url: 'https://mascotaveloz.pe/ricocat-atun-y-pescado-adulto-pate/' }, // revisar
    { id: 'pikotin', url: 'https://pikotin.pe/ricocat-lata-adulto-pate-atun-y-pescado-160gr-alimento-humedo-gato/' }, // revisar
    { id: 'casa-mascotas', url: 'https://www.casamascotas.pe/shop/ricocat-lata-pate-atun-y-pescado-160-g-12233' }, // revisar
    { id: 'petlover', url: 'https://petlover.pe/products/ricocat-adulto-pate-sabor-atun-y-pescado-lata-x-5-64-oz-160g' }, // revisar
    { id: 'vamos-pet-shop', url: 'https://vamospetshop.pe/gatos/ricocat-pate-de-atun-y-pescado-160gr-pid-51' }, // revisar
  ],
  'pate-salmon-180': [ // H8 PATÉ SABOR SALMÓN 180 G – ADULTOS
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-salmon-adulto-pate-lta-5.64-oz-159-g/AG000513.html' }, // revisar
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-pate-salmon-alimento-para-gatos-adultos/' }, // revisar
    { id: 'choco-pet', url: 'https://choco.pet/producto/ricocat-salmon-adulto-pate-lta-5-64-oznuevo/' }, // revisar
    { id: 'vamos-pet-shop', url: 'https://vamospetshop.pe/gatos/ricocat-pate-de-salmon-160gr-pid-50' }, // revisar
    { id: 'real-plaza', url: 'https://www.realplaza.com/ricocat-pate-salmon-adultos-lta-160-gr-124111/p' }, // revisar
    { id: 'convet', url: 'https://tottus-jockey.convet.com.pe/producto/ricocat-adult-pate-salmon-lta-x-5-64-oz/' }, // revisar
  ],
  'filetitos-atun-lata': [ // H9 FILETITOS EN SALSA SABOR ATÚN 190 G – ADULTOS
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-adulto-filetitos-de-atun-en-salsa-190gr/' },
    { id: 'vega', url: 'https://www.vega.pe/comida-para-gatos-ricocat-adulto-todas-las-razas-sabor-a-atun-lata-190gr-650034/p' }, // revisar
    { id: 'oechsle', url: 'https://www.oechsle.pe/comida-para-perros-ricocat-adulto-todas-las-razas-atun-lata-190g-1000684589/p' }, // revisar
  ],
  'filetitos-pavo-lata': [ // H10 FILETITOS EN SALSA SABOR PAVO 190 G – ADULTOS
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-pavo-adulto%C2%A0filetitos-en-salsa-lta-x-5.64-oz-159-g/AG000515.html' }, // revisar
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-adulto-filetitos-de-pavo-en-salsa-160gr/' }, // revisar
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pavo-filetitos-en-salsa-5-64-oz/p' }, // revisar
  ],
  'trocitos-pescado-lata': [ // H11 TROCITOS EN SALSA SABOR PESCADO 190 G – ADULTOS
    { id: 'falabella', url: 'https://www.falabella.com.pe/falabella-pe/product/125855709/ricocat-troc-en-salsa-pescado-adulto-190gr/125855711' },
    { id: 'metro', url: 'https://www.metro.pe/ricocat-trocitos-en-salsa-para-gatos-adultos-sabor-pescado-lata-160-gr/p' }, // revisar
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-pescado-adulto-trocitos-160-gr-20200343/p' }, // revisar
    { id: 'oechsle', url: 'https://www.oechsle.pe/comida-humeda-para-gatos-ricocat-trocitos-en-salsa-lata-adultos-sabor-pescado-160-gr-1000557848/p' }, // revisar
  ],
  'trocitos-pollo-lata': [ // H12 TROCITOS EN SALSA SABOR POLLO 190 G – ADULTOS
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/125855710/ricocat-troc-en-salsa-sb-pollo-adulto-190gr/125855713' },
    { id: 'metro', url: 'https://www.metro.pe/trocitos-en-salsa-ricocat-adultos-sabor-pollo-190g-1002216/p' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-adulto-trocitos-sabor-pollo-190gr/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-pollo-adulto-trocitos-160-gr-20200344/p' }, // revisar
  ],
  'filetitos-atun-pouch': [ // H13 FILETITOS EN SALSA SABOR ATÚN 85 G – ADULTOS
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-pouch-adulto-filetitos-en-salsa-atun-85gr/' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/128489075/ricocat-filetitos-sabor-atun-adulto-pouch-85-g/128489076' },
    { id: 'garuka', url: 'https://garuka.pe/p/ricocat-filetitos-sabor-atun-adultos-85-g/' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-filetitos-en-salsa-de-atun-gatos-adultos/' }, // revisar
    { id: 'rappi', url: 'https://www.rappi.com.pe/p/ricocat-ricocat-filetitos-atun-pouc-1012587' }, // revisar
  ],
  'filetitos-pavo-pouch': [ // H14 FILETITOS EN SALSA SABOR PAVO 85 G – ADULTOS
    { id: 'tottus', url: 'https://www.tottus.com.pe/tottus-pe/articulo/128489059/Ricocat-Filetitos-Sabor-Pavo-Adulto-Pouch-85-g/128489060' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-pouch-adulto-filetitos-en-salsa-pavo-85gr/' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-filetitos-en-salsa-de-pavo-gatos-adultos/' }, // revisar
  ],
  'trocitos-marinos-pouch': [ // H15 TROCITOS EN SALSA SABORES MARINOS 85 G – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-trocitos-marinos-adultos-pouch-85-g/p' },
    { id: 'metro', url: 'https://www.metro.pe/pouc-ricocat-troz-salsa-sabores-marinos-adult-x-85gr/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-trocitos-marinos-adultos-pouch-85-g-42454/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-adulto-trocitos-marino-en-salsa-pouch-85-g/AG000262.html' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-pouch-adulto-trocitos-salsa-marinos-85gr/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-marinos-trocitos-pouch-85-gr-20200358/p' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-trocitos-en-salsa-de-sabores-marinos/' },
  ],
  'trocitos-pollo-pouch': [ // H16 TROCITOS EN SALSA SABOR POLLO 85 G – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-trocitos-pollo-adultos-pouch-85-g/p' },
    { id: 'metro', url: 'https://www.metro.pe/pouc-ricocat-troz-sals-pollo-adult-x-85gr/p' },
    { id: 'wong', url: 'https://www.wong.pe/pouc-ricocat-troz-sals-pollo-adult-x-85gr/p' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-trocitos-pollo-adultos-pouch-85-g-42436/p' },
    { id: 'superpet', url: 'https://www.superpet.pe/gato/alimentos-y-snacks/alimento-humedo/ricocat-adulto-trocitos-salsa-pollo-pouch-85-g/AG000263.html' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pollo-trocitos-pouch-85-gr-20200357/p' },
  ],
  'trocitos-salmon-pouch': [ // H17 TROCITOS EN SALSA SABOR SALMÓN 85 G – ADULTOS
    { id: 'plaza-vea', url: 'https://www.plazavea.com.pe/comida-para-gatos-ricocat-trocitos-salmon-adultos-pouch-85-g/p' },
    { id: 'tottus', url: 'https://tottus.falabella.com.pe/tottus-pe/product/113369042/ricocat-trocitos-en-salsa-con-salmon-para-gatos-adultos-todas-las-razas-41575413/113369043' },
    { id: 'vivanda', url: 'https://www.vivanda.com.pe/comida-para-gatos-ricocat-trocitos-salmon-adultos-pouch-85-g-42451/p' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-salmon-trocitos-pouch-85-gr-20200359/p' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-trocitos-en-salsa-de-salmon-gatos-adultos/' },
  ],
  'trocitos-pescado-pouch': [ // H18 TROCITOS EN SALSA SABOR PESCADO 85 G – ADULTOS
    { id: 'metro', url: 'https://www.metro.pe/ricocat-ricocat-trocitos-pescado-pouch-85g-1006848/p' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-pouch-adulto-trocitos-en-salsa-pescado-85gr/' },
    { id: 'rappi', url: 'https://www.rappi.com.pe/p/ricocat-pouch-trocitos-en-salsa-sab-1204928' },
  ],
  'pate-esterilizados-180': [ // H19 PATÉ ESTERILIZADOS 180 G – ADULTOS
    { id: 'tottus', url: 'https://www.tottus.com.pe/tottus-pe/articulo/128642213/pate-esterilizado-ricocat-adulto-lata-180-g/128642214' },
    { id: 'metro', url: 'https://www.metro.pe/pate-ricocat-esterilizados-adulto-lata-180g-1012267/p' },
    { id: 'naricitas', url: 'https://naricitas.pet/producto/ricocat-lata-adulto-pate-esterilizado-180gr/' },
    { id: 'gopet', url: 'https://www.gopet.pe/ricocat-adulto-pate-esterilizado-180-gr/p' },
    { id: 'mascotify', url: 'https://mascotify.pe/gatos/alimento-gatos/alimento-humedo-gatos/ricocat-pate-adultos-esterilizados-alimento-humedo-para-gatos/' },
  ],
};
