'use strict';

var os = require('os');
var child = require('child_process');
var path = require('path');
var should = require('should');
var mm = require('mm');
var fs = require('fs');
var pedding = require('pedding');
var address = require('../');

var fixtures = path.join(__dirname, 'fixtures');

describe('address.test.js', function () {
  beforeEach(mm.restore);

  describe('regex check', function () {
    it('should MAC_IP_RE pass', function () {
      should.ok(address.MAC_IP_RE.test('  inet 10.7.84.211 netmask 0xfffffc00 broadcast 10.7.87.255'));
      should.ok(address.MAC_IP_RE.test('          inet addr:10.125.5.202  Bcast:10.125.15.255  Mask:255.255.240.0'));
    });

    it('should MAC_RE pass', function () {
      should.ok(address.MAC_RE.test('    ether c4:2c:03:32:d5:3d '));
      should.ok(address.MAC_RE.test('eth0      Link encap:Ethernet  HWaddr 00:16:3E:00:0A:29  '));
    });
  });

  describe('address()', function () {
    it('should return first ethernet addrs', function (done) {
      address(function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.mac && addr.mac.should.match(/^(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}$/i);
        addr.ip && addr.ip.should.match(/^\d+\.\d+\.\d+\.\d+$/);
        done();
      });
    });

    it('should return first ethernet addrs on aix', function (done) {
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'aix.txt'), 'utf8'));
      address('en', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('10.125.5.202');
        addr.mac.should.equal('00:16:3E:00:0A:29');
        done();
      });
    });

    it('should return first ethernet addrs on darwin', function (done) {
      mm(address, 'interface', function () {
        return { address: '192.168.2.104' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'darwin.txt'), 'utf8'));
      address('en', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('192.168.2.104');
        // addr.ipv6.should.match(/^[a-z0-9]{4}\:\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}$/);
        addr.mac.should.equal('78:ca:39:b0:e6:7d');
        done();
      });
    });

    it('should return first ethernet addrs on freebsd', function (done) {
      mm(address, 'interface', function () {
        return { address: '192.168.2.104' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'freebsd.txt'), 'utf8'));
      address('dc', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('192.168.2.104');
        addr.mac.should.equal('00:16:3E:00:0A:29');
        done();
      });
    });

    it('should return first ethernet addrs on linux', function (done) {
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'linux.txt'), 'utf8'));
      address('eth', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('10.125.5.202');
        // addr.ipv6.should.match(/^[a-z0-9]{4}\:\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}\:[a-z0-9]{4}$/);
        addr.mac.should.equal('00:16:3E:00:0A:29');
        done();
      });
    });

    it('should return first ethernet addrs on openbsd', function (done) {
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'openbsd.txt'), 'utf8'));
      address('fxp', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('10.125.5.202');
        addr.mac.should.equal('00:16:3E:00:0A:29');
        done();
      });
    });

    it('should return first ethernet addrs on sunos', function (done) {
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'sunos.txt'), 'utf8'));
      address('qfe', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.ip.should.equal('10.125.5.202');
        addr.mac.should.equal('0:3:ba:17:4b:e1');
        done();
      });
    });

    it('should return first vnic interface addrs on darwin', function (done) {
      mm(address, 'ip', function () {
        return '10.211.55.2';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'darwin.txt'), 'utf8'));
      address('vnic', function (err, addr) {
        should.not.exists(err);
        addr.ip.should.equal('10.211.55.2')
        // console.log(addr)
        // addr.mac.should.equal('00:1c:42:00:00:08');
        should.not.exists(addr.ipv6);
        done();
      });
    });

    it('should return first vnic interface addrs on sunos', function (done) {
      mm(address, 'ip', function () {
        return '3.4.5.6';
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'sunos.txt'), 'utf8'));
      address('vnic', function (err, addr) {
        should.not.exists(err);
        addr.ip.should.equal('3.4.5.6')
        should.not.exists(addr.ipv6);
        done();
      });
    });

    it('should return first local loopback addrs', function (done) {
      address('lo', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.should.property('ip').with.equal('127.0.0.1');
        done();
      });
    });

    it('should return first local loopback addrs on linux', function (done) {
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, 'linux.txt'), 'utf8'));
      address('lo', function (err, addr) {
        should.not.exists(err);
        addr.should.have.keys('ip', 'ipv6', 'mac');
        addr.should.property('ip').with.equal('127.0.0.1');
        done();
      });
    });
  });

  describe('interface()', function () {
    it('should return interface with family', function () {
      var item = address.interface();
      should.exists(item);
      item.should.have.property('address');
      item.should.have.property('family');
    });
  });

  describe('address.mac()', function () {
    it.skip('should return mac', function (done) {
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on aix', function (done) {
      mm(os, 'platform', function () {
        return 'aix';
      });
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on darwin', function (done) {
      mm(os, 'platform', function () {
        return 'darwin';
      });
      mm(address, 'interface', function () {
        return { address: '192.168.2.104' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on freebsd', function (done) {
      mm(os, 'platform', function () {
        return 'freebsd';
      });
      mm(address, 'interface', function () {
        return { address: '192.168.2.104' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on linux', function (done) {
      mm(os, 'platform', function () {
        return 'linux';
      });
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on openbsd', function (done) {
      mm(os, 'platform', function () {
        return 'openbsd';
      });
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on sunos', function (done) {
      mm(os, 'platform', function () {
        return 'sunos';
      });
      mm(address, 'interface', function () {
        return { address: '10.125.5.202' };
      });
      mm.data(child, 'exec', fs.readFileSync(path.join(fixtures, os.platform() + '.txt'), 'utf8'));
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.match(/(?:[a-z0-9]{1,2}\:){5}[a-z0-9]{2}/i);
        done();
      });
    });

    it('should return mock mac on win32', function (done) {
      mm(os, 'platform', function () {
        return 'win32';
      });
      mm(os, 'networkInterfaces', function () {
        return require(path.join(__dirname, './fixtures/win32_interfaces.json'));
      });

      address.mac(function (err, mac) {
        should.not.exists(err);
        should.exists(mac);
        mac.should.equal('e8:2a:ea:8b:c2:20');
        done();
      });
    });

    it('should return null when ip not exists', function (done) {
      mm(address, 'interface', function () {
        return null;
      });
      address.mac(function (err, mac) {
        should.not.exists(err);
        should.not.exists(mac);
        done();
      });
    });

    it('should return err when ifconfig cmd exec error', function (done) {
      mm(address, 'interface', function () {
        return null;
      });
      mm.error(child, 'exec');
      address.mac(function (err, mac) {
        // should.exists(err);
        should.not.exists(mac);
        done();
      });
    });
  });

  describe('address.ip()', function () {
    it('should return 127.0.0.1', function () {
      address.ip('lo').should.equal('127.0.0.1');
    });

    it('should return the first not 127.0.0.1 interface', function () {
      mm(os, 'networkInterfaces', function () {
        return {
          lo:
           [ { address: '127.0.0.1',
               family: 'IPv4',
               internal: true } ],
          bond0:
           [ { address: '10.206.52.79',
               family: 'IPv4',
               internal: false } ] };
      });
      address.ip().should.equal('10.206.52.79');
    });

    it('should return utun1', function () {
      mm(os, 'networkInterfaces', function () {
        return {
          lo:
           [ { address: '127.0.0.1',
               family: 'IPv4',
               internal: true } ],
         utun0:
          [ { address: 'fe80::696:ad3d:eeec:1722',
              family: 'IPv6',
              internal: false } ],
          utun1:
           [ { address: '10.206.52.79',
               family: 'IPv4',
               internal: false } ] };
      });
      address.ip('utun').should.equal('10.206.52.79');
      address.ipv6('utun').should.equal('fe80::696:ad3d:eeec:1722');
    });
  });

  describe('address.dns()', function () {
    it('should return dns servers on aix', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_aix.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return dns servers on darwin', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_darwin.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return dns servers on freebsd', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_freebsd.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return dns servers on linux', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_linux.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return dns servers on openbsd', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_openbsd.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return dns servers on sunos', function (done) {
      mm.data(fs, 'readFile', fs.readFileSync(path.join(fixtures, 'dns_sunos.txt'), 'utf8'));
      address.dns(function (err, servers) {
        should.not.exists(err);
        should.exists(servers);
        servers.should.be.instanceof(Array);
        servers.length.should.above(0);
        done();
      });
    });

    it('should return err when fs error', function (done) {
      mm.error(fs, 'readFile');
      address.dns(function (err, servers) {
        should.exists(err);
        should.not.exists(servers);
        done();
      });
    });
  });
});
